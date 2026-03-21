-- ========================================
-- PAUSA/RETOMADA DE PRAZO PARA PETIÇÕES
-- ========================================
-- Objetivo:
-- - Permitir congelar prazo quando faltar informação do cliente
-- - Retomar depois sem prejudicar o redator

ALTER TABLE public.petitions
  ADD COLUMN IF NOT EXISTS deadline_paused_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deadline_remaining_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS deadline_pause_reason TEXT,
  ADD COLUMN IF NOT EXISTS status_before_pause TEXT;

-- Índices auxiliares para filtros operacionais no admin
CREATE INDEX IF NOT EXISTS idx_petitions_status_deadline_paused_at
  ON public.petitions (status, deadline_paused_at);

COMMENT ON COLUMN public.petitions.deadline_paused_at IS
'Momento em que o prazo foi congelado por pendência do cliente.';

COMMENT ON COLUMN public.petitions.deadline_remaining_seconds IS
'Segundos restantes do prazo no instante da pausa.';

COMMENT ON COLUMN public.petitions.deadline_pause_reason IS
'Motivo textual da pausa do prazo (falta de informação/documentação do cliente).';

COMMENT ON COLUMN public.petitions.status_before_pause IS
'Status imediatamente anterior à pausa (ex.: in_progress).';
