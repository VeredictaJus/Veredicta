import { useEffect, useState } from 'react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { supabase } from '@/lib/supabaseClient';

interface PetitionAlert {
  id: string;
  title: string;
  deadline: string;
  minutesRemaining: number;
}

export function useDeadlineAlert() {
  const { user } = useNewAuth();
  const [alerts, setAlerts] = useState<PetitionAlert[]>([]);
  const [hasShownAlert, setHasShownAlert] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.uid) return;

    const checkDeadlines = async () => {
      try {
        console.log('🔍 [DEADLINE ALERT] Verificando deadlines para redator:', user.uid);
        
        // Buscar petições em andamento do redator
        const { data: petitions, error } = await supabase
          .from('petitions')
          .select('id, title, deadline')
          .eq('assigned_writer_id', user.uid)
          .in('status', ['in_progress', 'assigned'])
          .not('deadline', 'is', null);

        if (error) {
          console.error('❌ [DEADLINE ALERT] Erro ao buscar petições:', error);
          return;
        }

        if (!petitions || petitions.length === 0) {
          console.log('ℹ️ [DEADLINE ALERT] Nenhuma petição em andamento encontrada');
          return;
        }

        console.log('📋 [DEADLINE ALERT] Petições encontradas:', petitions.length, petitions);

        const now = new Date();
        const alertPetitions: PetitionAlert[] = [];

        petitions.forEach(petition => {
          const deadline = new Date(petition.deadline);
          const diffMs = deadline.getTime() - now.getTime();
          const diffMinutes = Math.floor(diffMs / (1000 * 60));

          // Alerta se falta entre 55-65 minutos (janela de 10min para garantir que pegue)
          // Isso alerta 1h antes do deadline de 18h (ou seja, às 17h)
          if (diffMinutes >= 55 && diffMinutes <= 65 && !hasShownAlert.has(petition.id)) {
            console.log('⏰ [DEADLINE ALERT] Alerta detectado:', {
              petitionId: petition.id,
              title: petition.title,
              deadline: deadline.toISOString(),
              minutesRemaining: diffMinutes,
              now: now.toISOString()
            });
            
            alertPetitions.push({
              id: petition.id,
              title: petition.title,
              deadline: petition.deadline,
              minutesRemaining: diffMinutes
            });
          }
        });

        if (alertPetitions.length > 0) {
          console.log('✅ [DEADLINE ALERT] Alertas encontrados:', alertPetitions.length, alertPetitions);
          setAlerts(alertPetitions);
          setHasShownAlert(prev => new Set([...prev, ...alertPetitions.map(p => p.id)]));
          
          // 🔔 Criar notificação no banco de dados para cada alerta
          alertPetitions.forEach(async (petition) => {
            try {
              await supabase.from('app_2d8133c678_notifications').insert({
                user_id: user.uid,
                title: '⏰ Prazo Próximo!',
                body: `Falta aproximadamente 1 hora para o prazo da petição "${petition.title}". Finalize e envie o quanto antes!`,
                type: 'deadline',
                priority: 'urgent',
                related_entity_type: 'petition',
                related_entity_id: petition.id
              });
              console.log('✅ Notificação de deadline criada para petição:', petition.id);
            } catch (error) {
              console.error('❌ Erro ao criar notificação de deadline:', error);
            }
          });
        }
      } catch (error) {
        console.error('❌ Erro ao verificar deadlines:', error);
      }
    };

    // Verificar a cada 5 minutos
    const interval = setInterval(checkDeadlines, 5 * 60 * 1000);
    
    // Verificar imediatamente ao montar
    checkDeadlines();

    return () => clearInterval(interval);
  }, [user?.uid]);

  const dismissAlert = (petitionId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== petitionId));
  };

  const dismissAll = () => {
    setAlerts([]);
  };

  return { alerts, dismissAlert, dismissAll };
}

