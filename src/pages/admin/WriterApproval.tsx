import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabaseClient'
import { CheckCircle, XCircle, Eye, Download, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { EmailService } from '@/services/emailService'

interface WriterProfile {
  id: string
  firebase_uid: string
  email: string
  full_name: string
  phone: string
  address: string
  status: string
  created_at: string
  updated_at: string
  petition_files?: {
    petition1?: string
    petition2?: string
    petition3?: string
  }
  oab_documents?: {
    oab_front?: string
    oab_back?: string
  }
}

export default function WriterApproval() {
  const [writers, setWriters] = useState<WriterProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('pending_approval')
  const [selectedWriter, setSelectedWriter] = useState<WriterProfile | null>(null)
  const [showPetitionsModal, setShowPetitionsModal] = useState(false)
  const [showOABModal, setShowOABModal] = useState(false)
  const [oabImageUrls, setOabImageUrls] = useState<{ front?: string | null; back?: string | null }>({})

  // ✅ Função auxiliar para truncar nomes muito longos (> 50 caracteres)
  const truncateLongName = (name: string | undefined | null): string => {
    if (!name) return '';
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };

  // ✅ Função auxiliar para truncar emails muito longos (> 40 caracteres)
  const truncateLongEmail = (email: string | undefined | null): string => {
    if (!email) return '';
    if (email.length > 40) {
      return email.substring(0, 37) + '...';
    }
    return email;
  };

  // ✅ Função auxiliar para gerar URL assinada ou usar URL existente
  const getSignedUrl = async (filePathOrUrl: string | undefined | null, bucket: 'writer-petitions' | 'oab-documents'): Promise<string | null> => {
    if (!filePathOrUrl) return null;
    
    // Se já é uma URL completa (http/https), retornar diretamente
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
      return filePathOrUrl;
    }
    
    // Se é apenas um caminho, gerar URL assinada
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePathOrUrl, 3600); // 1 hora
      
      if (error || !data?.signedUrl) {
        console.error('❌ Erro ao gerar URL assinada:', error);
        toast.error('Erro ao abrir arquivo. Tente novamente.');
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('❌ Erro ao gerar URL assinada:', error);
      toast.error('Erro ao abrir arquivo. Tente novamente.');
      return null;
    }
  };

  // ✅ Função para abrir petição
  const handleOpenPetition = async (filePathOrUrl: string | undefined | null) => {
    if (!filePathOrUrl) return;
    
    const url = await getSignedUrl(filePathOrUrl, 'writer-petitions');
    if (url) {
      window.open(url, '_blank');
    }
  };

  // ✅ Função para baixar petição
  const handleDownloadPetition = async (filePathOrUrl: string | undefined | null, fileName: string) => {
    if (!filePathOrUrl) return;
    
    const url = await getSignedUrl(filePathOrUrl, 'writer-petitions');
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    }
  };

  // ✅ Função para abrir OAB
  const handleOpenOAB = async (filePathOrUrl: string | undefined | null) => {
    if (!filePathOrUrl) return;
    
    const url = await getSignedUrl(filePathOrUrl, 'oab-documents');
    if (url) {
      window.open(url, '_blank');
    }
  };

  // ✅ Função para baixar OAB
  const handleDownloadOAB = async (filePathOrUrl: string | undefined | null, fileName: string) => {
    if (!filePathOrUrl) return;
    
    const url = await getSignedUrl(filePathOrUrl, 'oab-documents');
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    }
  };

  // ✅ Função para obter URL da imagem OAB (para preview)
  const getOABImageUrl = async (filePathOrUrl: string | undefined | null): Promise<string | null> => {
    if (!filePathOrUrl) return null;
    
    // Se já é uma URL completa, retornar diretamente
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
      return filePathOrUrl;
    }
    
    // Se é apenas um caminho, gerar URL assinada
    try {
      const { data, error } = await supabase.storage
        .from('oab-documents')
        .createSignedUrl(filePathOrUrl, 3600); // 1 hora
      
      if (error || !data?.signedUrl) {
        console.error('❌ Erro ao gerar URL assinada para imagem:', error);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('❌ Erro ao gerar URL assinada para imagem:', error);
      return null;
    }
  };

  useEffect(() => {
    loadWriters()
  }, [])

  // ✅ Carregar URLs das imagens OAB quando o modal for aberto
  useEffect(() => {
    if (showOABModal && selectedWriter?.oab_documents) {
      const loadOABUrls = async () => {
        const frontUrl = selectedWriter.oab_documents.oab_front
          ? await getOABImageUrl(selectedWriter.oab_documents.oab_front)
          : null
        const backUrl = selectedWriter.oab_documents.oab_back
          ? await getOABImageUrl(selectedWriter.oab_documents.oab_back)
          : null
        
        setOabImageUrls({ front: frontUrl, back: backUrl })
      }
      
      loadOABUrls()
    } else {
      setOabImageUrls({})
    }
  }, [showOABModal, selectedWriter?.oab_documents])

  const loadWriters = async () => {
    try {
      // ✅ OTIMIZAÇÃO: Adicionar limit para performance
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, firebase_uid, email, full_name, phone, address, status, created_at, updated_at, petition_files, oab_documents')
        .eq('role', 'writer')
        .order('created_at', { ascending: false })
        .limit(500); // Limitar a 500 redatores mais recentes

      if (error) {
        console.error('Erro ao carregar redatores:', error)
        toast.error('Erro ao carregar redatores')
        return
      }

      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log(`✅ ${data?.length || 0} redatores carregados`)
      }
      
      setWriters(data || [])
    } catch (error) {
      console.error('Erro ao carregar redatores:', error)
      toast.error('Erro ao carregar redatores')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (writerId: string) => {
    setActionLoading(writerId)
    try {
      // Buscar dados do redator antes de aprovar
      const writer = writers.find(w => w.id === writerId)
      
      // ✅ Marcar redator como aprovado E verificado
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'approved',
          verification_status: 'verified' // Marcar como verificado ao aprovar
        })
        .eq('id', writerId)

      if (error) {
        console.error('Erro ao aprovar redator:', error)
        toast.error('Erro ao aprovar redator')
        return
      }

      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('✅ Redator aprovado:', writerId)
      }
      
      toast.success('Redator aprovado com sucesso! Ele já pode acessar a plataforma.')
      
      // Enviar email de boas-vindas ao redator aprovado
      if (writer?.email && writer?.full_name) {
        try {
          await EmailService.sendWriterWelcomeEmail(writer.email, writer.full_name)
          // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
          if (import.meta.env.DEV) {
            console.log('📧 Email de boas-vindas enviado para:', writer.email)
          }
        } catch (emailError) {
          console.error('⚠️ Erro ao enviar email de boas-vindas:', emailError)
          // Não falhar a aprovação se o email falhar
        }
      }
      
      // ✅ OTIMIZAÇÃO: Atualizar lista localmente (remover loadWriters() redundante)
      setWriters(prev => prev.map(w => 
        w.id === writerId ? { ...w, status: 'approved' } : w
      ))
      // Removido: await loadWriters() - redundante, já atualizamos localmente
    } catch (error) {
      console.error('Erro ao aprovar redator:', error)
      toast.error('Erro ao aprovar redator')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (writerId: string) => {
    setActionLoading(writerId)
    try {
      // Buscar dados do redator antes de rejeitar
      const writer = writers.find(w => w.id === writerId)
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: 'rejected' })
        .eq('id', writerId)

      if (error) {
        console.error('Erro ao rejeitar redator:', error)
        toast.error('Erro ao rejeitar redator')
        return
      }

      // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('❌ Redator rejeitado:', writerId)
      }
      
      toast.success('Redator rejeitado. Ele será notificado.')
      
      // Enviar email de rejeição ao redator
      if (writer?.email && writer?.full_name) {
        try {
          await EmailService.sendWriterRejectionEmail(writer.email, writer.full_name)
          // ✅ OTIMIZAÇÃO: Console.log apenas em desenvolvimento
          if (import.meta.env.DEV) {
            console.log('📧 Email de rejeição enviado para:', writer.email)
          }
        } catch (emailError) {
          console.error('⚠️ Erro ao enviar email de rejeição:', emailError)
          // Não falhar a rejeição se o email falhar
        }
      }
      
      // ✅ OTIMIZAÇÃO: Atualizar lista localmente (remover loadWriters() redundante)
      setWriters(prev => prev.map(w => 
        w.id === writerId ? { ...w, status: 'rejected' } : w
      ))
      // Removido: await loadWriters() - redundante, já atualizamos localmente
    } catch (error) {
      console.error('Erro ao rejeitar redator:', error)
      toast.error('Erro ao rejeitar redator')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">Pendente</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">Aprovado</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">Rejeitado</Badge>
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Desconhecido</Badge>
    }
  }

  // Filtrar redatores por status
  const filteredWriters = useMemo(() => {
    if (statusFilter === 'all') return writers;
    return writers.filter(w => w.status === statusFilter);
  }, [writers, statusFilter]);

  // ✅ OTIMIZAÇÃO: Usar useMemo para contadores (evita recalcular a cada render)
  const statusCounts = useMemo(() => ({
    pending: writers.filter(w => w.status === 'pending_approval').length,
    approved: writers.filter(w => w.status === 'approved').length,
    rejected: writers.filter(w => w.status === 'rejected').length,
    total: writers.length,
  }), [writers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Aprovação de Redatores</h1>
          <p className="text-muted-foreground">Gerencie as solicitações de cadastro de redatores</p>
        </div>
        
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending_approval">Pendentes ({statusCounts.pending})</SelectItem>
            <SelectItem value="approved">Aprovados ({statusCounts.approved})</SelectItem>
            <SelectItem value="rejected">Rejeitados ({statusCounts.rejected})</SelectItem>
            <SelectItem value="all">Todos ({statusCounts.total})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {!loading && (
          <>
            {filteredWriters.map((writer) => (
          <Card key={writer.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate" title={writer.full_name || 'Nome não informado'}>
                    {truncateLongName(writer.full_name) || 'Nome não informado'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground truncate" title={writer.email}>
                    {truncateLongEmail(writer.email)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(writer.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">{writer.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Endereço</p>
                  <p className="text-sm text-muted-foreground">{writer.address || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Cadastrado em: {writer.created_at ? new Date(writer.created_at).toLocaleDateString('pt-BR') : '—'}
                </div>
                
                <div className="flex items-center gap-2">
                  {writer.status === 'pending_approval' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(writer.id)}
                        disabled={actionLoading === writer.id}
                        className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white dark:hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(writer.id)}
                        disabled={actionLoading === writer.id}
                        className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white dark:hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedWriter(writer)
                      setShowPetitionsModal(true)
                    }}
                    className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Petições
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedWriter(writer)
                      setShowOABModal(true)
                    }}
                    className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-700"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Ver Carteirinha OAB
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
          </>
        )}
      </div>

      {!loading && filteredWriters.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {writers.length === 0 
              ? 'Nenhum redator cadastrado' 
              : `Nenhum redator ${statusFilter === 'pending_approval' ? 'pendente' : statusFilter === 'approved' ? 'aprovado' : 'rejeitado'}`
            }
          </p>
        </div>
      )}

      {/* Modal de Petições Autorais */}
      <Dialog open={showPetitionsModal} onOpenChange={setShowPetitionsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <span className="truncate" title={selectedWriter?.full_name || 'Redator'}>
                Petições Autorais - {truncateLongName(selectedWriter?.full_name) || 'Redator'}
              </span>
            </DialogTitle>
            <DialogDescription>
              Amostras de trabalho enviadas durante o cadastro
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedWriter?.petition_files ? (
              <>
                {/* Petição 1 */}
                {selectedWriter.petition_files.petition1 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium">Petição Autoral 1</p>
                            <p className="text-sm text-muted-foreground">Amostra de trabalho</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPetition(selectedWriter.petition_files?.petition1)}
                            className="hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPetition(selectedWriter.petition_files?.petition1, 'peticao_1.pdf')}
                            className="hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Petição 2 */}
                {selectedWriter.petition_files.petition2 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium">Petição Autoral 2</p>
                            <p className="text-sm text-muted-foreground">Amostra de trabalho</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPetition(selectedWriter.petition_files?.petition2)}
                            className="hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPetition(selectedWriter.petition_files?.petition2, 'peticao_2.pdf')}
                            className="hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Petição 3 */}
                {selectedWriter.petition_files.petition3 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium">Petição Autoral 3</p>
                            <p className="text-sm text-muted-foreground">Amostra de trabalho</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPetition(selectedWriter.petition_files?.petition3)}
                            className="hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPetition(selectedWriter.petition_files?.petition3, 'peticao_3.pdf')}
                            className="hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhuma petição autoral encontrada</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Carteirinha OAB */}
      <Dialog open={showOABModal} onOpenChange={setShowOABModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="truncate" title={selectedWriter?.full_name || 'Redator'}>
                Carteirinha OAB - {truncateLongName(selectedWriter?.full_name) || 'Redator'}
              </span>
            </DialogTitle>
            <DialogDescription>
              Documentos de identificação profissional enviados durante o cadastro
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {selectedWriter?.oab_documents ? (
              <>
                {/* OAB Frente */}
                {selectedWriter.oab_documents.oab_front && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Carteirinha OAB - Frente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Preview da imagem/PDF */}
                        <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                          {(selectedWriter.oab_documents.oab_front?.toLowerCase().endsWith('.pdf') || selectedWriter.oab_documents.oab_front?.toLowerCase().includes('.pdf')) ? (
                            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800">
                              <div className="text-center">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Arquivo PDF</p>
                                <Button
                                  onClick={() => handleOpenOAB(selectedWriter.oab_documents?.oab_front)}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Abrir PDF
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={oabImageUrls.front || ''} 
                              alt="Carteirinha OAB - Frente"
                              className="w-full h-auto"
                              onClick={() => handleOpenOAB(selectedWriter.oab_documents?.oab_front)}
                              style={{ cursor: 'pointer' }}
                              onError={(e) => {
                                console.error('Erro ao carregar imagem OAB frente');
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        
                        {/* Botões de ação */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenOAB(selectedWriter.oab_documents?.oab_front)}
                            className="hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir em nova aba
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadOAB(selectedWriter.oab_documents?.oab_front, 'oab_frente')}
                            className="hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* OAB Verso */}
                {selectedWriter.oab_documents.oab_back && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Carteirinha OAB - Verso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Preview da imagem/PDF */}
                        <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                          {(selectedWriter.oab_documents.oab_back?.toLowerCase().endsWith('.pdf') || selectedWriter.oab_documents.oab_back?.toLowerCase().includes('.pdf')) ? (
                            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800">
                              <div className="text-center">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Arquivo PDF</p>
                                <Button
                                  onClick={() => handleOpenOAB(selectedWriter.oab_documents?.oab_back)}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Abrir PDF
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={oabImageUrls.back || ''} 
                              alt="Carteirinha OAB - Verso"
                              className="w-full h-auto"
                              onClick={() => handleOpenOAB(selectedWriter.oab_documents?.oab_back)}
                              style={{ cursor: 'pointer' }}
                              onError={(e) => {
                                console.error('Erro ao carregar imagem OAB verso');
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        
                        {/* Botões de ação */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenOAB(selectedWriter.oab_documents?.oab_back)}
                            className="hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir em nova aba
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadOAB(selectedWriter.oab_documents?.oab_back, 'oab_verso')}
                            className="hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhuma carteirinha OAB encontrada</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}








