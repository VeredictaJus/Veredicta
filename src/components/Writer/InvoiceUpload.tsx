import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

interface Invoice {
  name: string;
  id: string;
  created_at: string;
  signedUrl?: string;
}

const InvoiceUpload: React.FC = () => {
  const { user } = useNewAuth();
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState<string>(`${new Date().getMonth() + 1}`);
  const [year, setYear] = useState<string>(`${currentYear}`);
  const [amount, setAmount] = useState<string>('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Obter o ID correto do usuário
  const userId = user?.uid;
  
  console.log('📄 InvoiceUpload - User:', user);
  console.log('📄 InvoiceUpload - userId:', userId);

  const fetchInvoices = async () => {
    if (!userId) {
      console.log('📄 fetchInvoices - Sem userId');
      return;
    }

    console.log('📄 fetchInvoices - Buscando notas para userId:', userId);

    const { data, error } = await supabase
      .storage
      .from('invoices')
      .list(`${userId}`, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error('❌ Erro ao buscar notas:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Notas encontradas:', data);
      console.log('✅ Total de notas:', data?.length || 0);
      
      // Gerar signed URLs para cada nota fiscal (válidas por 1 hora)
      const invoicesWithUrls = await Promise.all(
        (data || []).map(async (invoice) => {
          const filePath = `${userId}/${invoice.name}`;
          const { data: urlData, error: urlError } = await supabase
            .storage
            .from('invoices')
            .createSignedUrl(filePath, 3600); // 1 hora de validade

          if (urlError) {
            console.error('❌ Erro ao gerar URL para:', invoice.name, urlError);
          }

          return {
            ...invoice,
            signedUrl: urlData?.signedUrl || null
          };
        })
      );

      setInvoices(invoicesWithUrls);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [userId]);

  // Formatar valor como moeda brasileira
  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    // Converte para número e formata
    const formatted = (Number(numbers) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatted;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setAmount(formatted);
  };

  const handleUpload = async () => {
    if (!file || !userId || !amount) return;
    setUploading(true);

    try {
      // Usar Edge Function para upload seguro
      const fileName = `${year}-${month.padStart(2, '0')}-${file.name}`;
      const formData = new FormData();
      formData.append('file', file);

      // Converter valor formatado para número (remover pontos e substituir vírgula por ponto)
      const amountNumber = parseFloat(amount.replace(/\./g, '').replace(',', '.'));

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-invoice`, {
        method: 'POST',
        headers: {
          'x-firebase-uid': userId,
          'x-file-name': fileName,
          'x-invoice-amount': amountNumber.toString(),
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar nota fiscal');
      }

      console.log('✅ Upload bem-sucedido:', result);
      
      setShowSuccessModal(true);
      setFile(null);
      setAmount('');
      
      // Aguardar um pouco para o storage processar antes de buscar novamente
      setTimeout(() => {
        console.log('🔄 Atualizando lista de notas...');
        fetchInvoices();
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro desconhecido ao enviar nota fiscal');
      setShowErrorModal(true);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete || !userId) return;
    setDeleting(true);

    try {
      const filePath = `${userId}/${invoiceToDelete.name}`;
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-invoice`, {
        method: 'POST',
        headers: {
          'x-firebase-uid': userId,
          'x-file-path': filePath,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Erro ao excluir nota fiscal');
      }

      console.log('✅ Nota fiscal excluída com sucesso:', result);
      
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
      
      // Atualizar lista de notas
      setTimeout(() => {
        console.log('🔄 Atualizando lista de notas após exclusão...');
        fetchInvoices();
      }, 500);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro desconhecido ao excluir nota fiscal');
      setShowErrorModal(true);
      setShowDeleteModal(false);
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-10 p-6 bg-card rounded-lg shadow border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">📄 Enviar Nota Fiscal</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Mês</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={`${i + 1}`}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ano</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={`${y}`}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Valor (R$)</Label>
          <Input
            type="text"
            placeholder="0,00"
            value={amount}
            onChange={handleAmountChange}
            className="text-right"
          />
        </div>

        <div>
          <Label>Arquivo PDF</Label>
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <Button
        onClick={handleUpload}
        className="mt-4"
        disabled={!file || !amount || uploading}
      >
        {uploading ? 'Enviando...' : 'Enviar Nota Fiscal'}
      </Button>

      {/* Lista de notas fiscais enviadas */}
      <div className="mt-6">
        <h3 className="font-medium text-foreground mb-2">Notas Enviadas</h3>
        <ul className="text-sm space-y-2">
          {invoices.length === 0 ? (
            <li className="text-muted-foreground">Nenhuma nota enviada ainda.</li>
          ) : (
            invoices.map((inv) => (
              <li key={inv.name} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted/50">
                <div className="flex-1">
                  {inv.signedUrl ? (
                    <a
                      href={inv.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {inv.name}
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">
                      {inv.name} (link indisponível)
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(inv)}
                  disabled={deleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Modal de Sucesso */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-foreground">
              Nota Fiscal Enviada!
            </DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground mt-2">
              Sua nota fiscal foi enviada com sucesso e já está disponível no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="px-8"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Erro */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-foreground">
              Erro ao Enviar
            </DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground mt-2">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => setShowErrorModal(false)}
              variant="destructive"
              className="px-8"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3">
                <Trash2 className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-foreground">
              Excluir Nota Fiscal?
            </DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground mt-2">
              <div>Tem certeza que deseja excluir a nota fiscal:</div>
              <div className="font-semibold break-all my-2 px-4">
                {invoiceToDelete?.name}
              </div>
              <span className="text-red-600 dark:text-red-400 font-medium mt-2 block">
                Esta ação não pode ser desfeita.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3 mt-4">
            <Button 
              onClick={() => {
                setShowDeleteModal(false);
                setInvoiceToDelete(null);
              }}
              variant="outline"
              className="px-6"
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              variant="destructive"
              className="px-6"
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceUpload;
