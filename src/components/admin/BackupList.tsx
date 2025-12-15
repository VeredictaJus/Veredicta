import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface BackupFile {
  name: string;
  size: number;
}

export default function BackupList() {
  const { user } = useNewAuth();
  const [files, setFiles] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar lista de arquivos
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .storage
        .from('admin-backups')
        .list('', { limit: 100 });

      if (error) {
        console.error('Erro ao listar arquivos:', error.message);
        toast.error("Erro ao listar backups");
        setLoading(false);
        return;
      }

      const fileData: BackupFile[] = data.map((file) => ({
        name: file.name,
        size: file.metadata?.size || 0,
      }));

      setFiles(fileData);
      setLoading(false);
    };

    fetchFiles();
  }, []);

  // Baixar backup
  const handleDownload = async (fileName: string) => {
    const { data, error } = await supabase
      .storage
      .from('admin-backups')
      .download(fileName);

    if (error) {
      toast.error('Erro ao baixar arquivo');
      return;
    }

    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Restaurar backup
  const handleRestore = async (fileName: string) => {
    const confirm = window.confirm(`Tem certeza que deseja restaurar o backup "${fileName}"? Isso substituirá os dados existentes.`);
    if (!confirm) return;

    try {
      // Verifica autenticação
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Verifica se é admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles_v2')
        .select('role')
        .eq('firebase_uid', user.uid)
        .single();

      if (profileError || profile?.role !== 'admin') {
        toast.error("Apenas administradores podem restaurar backups");
        return;
      }

      // Baixa arquivo do bucket
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('admin-backups')
        .download(fileName);

      if (downloadError || !fileData) {
        toast.error("Erro ao baixar backup");
        return;
      }

      const text = await fileData.text();
      const backup = JSON.parse(text);

      if (!backup || typeof backup !== 'object') {
        toast.error("Formato de backup inválido");
        return;
      }

      for (const table in backup) {
        const rows = backup[table];

        if (!Array.isArray(rows)) continue;

        // Apaga dados da tabela (com exceção do id = 0 se necessário)
        await supabase.from(table).delete().neq('id', 0);

        // Restaura os dados
        if (rows.length > 0) {
          const { error: insertError } = await supabase.from(table).insert(rows);
          if (insertError) {
            console.error(insertError);
            toast.error(`Erro ao restaurar tabela "${table}"`);
            return;
          }
        }
      }

      toast.success("Backup restaurado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao restaurar");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Backups Salvos</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <p>Carregando backups...</p>
        ) : files.length === 0 ? (
          <p className="text-muted-foreground">Nenhum backup encontrado.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between border p-3 rounded"
              >
                <div className="space-y-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(file.name)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                  <Button
                    onClick={() => handleRestore(file.name)}
                    variant="destructive"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}