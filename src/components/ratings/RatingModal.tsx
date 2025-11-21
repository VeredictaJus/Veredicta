import React, { useState } from 'react';
import { Star, MessageSquare, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { DatabaseService } from '../../services/databaseService';
import { useNewAuth } from '../../contexts/NewAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { EmailService } from '@/services/emailService';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  petition: {
    id: string;
    title: string;
    assigned_writer_id: string;
  };
  onRatingSubmitted?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  petition,
  onRatingSubmitted
}) => {
  const { user } = useNewAuth();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.uid || !petition.assigned_writer_id || rating === 0) {
      toast.error('Por favor, selecione uma avaliação de 1 a 5 estrelas.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1️⃣ Salvar a avaliação
      const ratingData = {
        writer_id: petition.assigned_writer_id,
        client_id: user.uid,
        petition_id: petition.id,
        rating,
        comment: comment.trim() || undefined
      };

      const result = await DatabaseService.createWriterRating(ratingData);
      
      if (!result) {
        toast.error('Erro ao enviar avaliação. Tente novamente.');
        return;
      }

      console.log('✅ Avaliação salva com sucesso:', {
        ratingId: result.id,
        writerId: petition.assigned_writer_id,
        rating: rating,
        petitionId: petition.id
      });
      
      // Aguardar um pouco para o trigger atualizar o profiles_v2
      // O trigger atualiza automaticamente, mas pode levar alguns milissegundos
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2️⃣ Aprovar a petição automaticamente
      const { error: approveError } = await supabase
        .from('petitions')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', petition.id)
        .eq('client_id', user.uid);

      if (approveError) {
        console.error('Erro ao aprovar petição:', approveError);
        toast.error('Avaliação salva, mas erro ao aprovar petição.');
        return;
      }

      // Enviar email ao redator informando que a petição foi aprovada
      try {
        const { data: writerProfile } = await supabase
          .from('user_profiles')
          .select('email, full_name')
          .eq('firebase_uid', petition.assigned_writer_id)
          .single();
        
        const { data: petitionData } = await supabase
          .from('petitions')
          .select('display_id, title')
          .eq('id', petition.id)
          .single();
        
        if (writerProfile?.email && petitionData) {
          const writerName = writerProfile.full_name || writerProfile.email.split('@')[0];
          const petitionDisplayId = petitionData.display_id || petition.id;
          
          await EmailService.sendPetitionApprovedEmail(
            writerProfile.email,
            writerName,
            petitionDisplayId,
            petitionData.title
          );
          console.log('📧 Email de aprovação enviado ao redator:', writerProfile.email);
        }
      } catch (emailError) {
        console.error('⚠️ Erro ao enviar email de aprovação:', emailError);
        // Não falhar a aprovação se o email falhar
      }

      // 3️⃣ Enviar mensagem de agradecimento e desativar conversa
      try {
        console.log('🔄 Enviando mensagem final e desativando conversa para petição aprovada:', petition.id);
        
        // 🚀 BUSCAR CONVERSAS PELO petition_id (mais confiável que título)
        const { data: conversationsData, error: convSearchError } = await supabase
          .from('conversations')
          .select('id, title, metadata, petition_id')
          .eq('type', 'petition')
          .eq('status', 'active')
          .eq('petition_id', petition.id);

        if (convSearchError) {
          console.error('❌ Erro ao buscar conversas:', convSearchError);
        }

        // Usar let para permitir reatribuição
        let relatedConversations = conversationsData;
        
        console.log('📋 Conversas encontradas pelo petition_id:', relatedConversations);

        // Se não encontrou por petition_id, tentar por título (fallback)
        if (!relatedConversations || relatedConversations.length === 0) {
          console.log('⚠️ Nenhuma conversa encontrada por petition_id, tentando por título...');
          
          const { data: convByTitle } = await supabase
            .from('conversations')
            .select('id, title, metadata, petition_id')
            .eq('type', 'petition')
            .eq('status', 'active')
            .ilike('title', `%${petition.title}%`);
          
          console.log('📋 Conversas encontradas por título:', convByTitle);
          
          if (convByTitle && convByTitle.length > 0) {
            relatedConversations = convByTitle;
          }
        }

        if (relatedConversations && relatedConversations.length > 0) {
          for (const conv of relatedConversations) {
            console.log(`🔄 Processando conversa ${conv.id} (petition_id: ${conv.petition_id})`);
            
            // Enviar mensagem automática de agradecimento PELO REDATOR
            const finalMessage = `🎉 Obrigado por aprovar! A petição foi concluída com sucesso.\n\nVocê pode baixar os arquivos a qualquer momento em Minhas Petições.`;
            
            // Usar o ID do redator (assigned_writer_id) como sender_id
            const writerId = petition.assigned_writer_id;
            
            if (!writerId) {
              console.warn(`⚠️ Petição ${petition.id} não tem assigned_writer_id, pulando mensagem`);
              continue;
            }
            
            const { error: msgError } = await supabase
              .from('messages')
              .insert({
                conversation_id: conv.id,
                sender_id: writerId, // Enviar pelo redator, não pelo sistema
                content: finalMessage,
                message_type: 'text', // Mudar para 'text' para aparecer como mensagem do redator
                status: 'sent'
              });
            
            if (msgError) {
              console.error(`❌ Erro ao enviar mensagem para conversa ${conv.id}:`, msgError);
            } else {
              console.log(`✅ Mensagem de conclusão enviada pelo redator para conversa ${conv.id}`);
            }
            
            // Arquivar a conversa (arquivamento automático do sistema)
            const { error: archiveError } = await supabase
              .from('conversations')
              .update({ 
                status: 'archived',
                metadata: {
                  ...conv.metadata,
                  system_archived: true, // Flag para impedir desarquivamento
                  archived_reason: 'petition_approved',
                  archived_at: new Date().toISOString()
                },
                updated_at: new Date().toISOString()
              })
              .eq('id', conv.id);
            
            if (archiveError) {
              console.error(`❌ Erro ao arquivar conversa ${conv.id}:`, archiveError);
            } else {
              console.log(`✅ Conversa ${conv.id} arquivada automaticamente (sistema)`);
            }
          }
          console.log('✅ Todas as conversas da petição foram finalizadas');
        } else {
          console.log('⚠️ Nenhuma conversa ativa encontrada para esta petição (nem por ID nem por título)');
          console.log('   Petition ID:', petition.id);
          console.log('   Petition Title:', petition.title);
        }
      } catch (convError) {
        console.error('❌ Erro ao finalizar conversa:', convError);
        // Não falha a aprovação se a finalização falhar
      }

      // 4️⃣ Sucesso!
      toast.success('✨ Petição aprovada e avaliação enviada com sucesso!');
      onRatingSubmitted?.();
      onClose();
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Erro ao processar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setHoveredRating(0);
      setComment('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Avaliar Redator</h2>
          <button
            onClick={() => toast.info('⚠️ A avaliação é obrigatória para aprovar a petição.')}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 cursor-not-allowed"
            title="Avaliação obrigatória"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Aviso de Obrigatoriedade */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Avaliação Obrigatória:</strong> Para aprovar esta petição, você deve avaliar o trabalho do redator.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Petição:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {petition.title}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Como você avalia o trabalho do redator?
            </h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                  className="transition-colors disabled:opacity-50"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
                {rating === 1 && 'Muito insatisfeito'}
                {rating === 2 && 'Insatisfeito'}
                {rating === 3 && 'Neutro'}
                {rating === 4 && 'Satisfeito'}
                {rating === 5 && 'Muito satisfeito'}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Comentário (opcional)
              </h3>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Compartilhe sua experiência com este redator..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Aprovando e Enviando...' : 'Aprovar e Enviar Avaliação'}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Voltar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se você voltar agora, a petição <strong>NÃO será aprovada</strong> e continuará como "Entregue". 
                    Você poderá aprovar e avaliar depois quando estiver pronto.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continuar Avaliando</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClose}>
                    Sim, Voltar Depois
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;