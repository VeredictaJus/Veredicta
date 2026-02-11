-- Adiciona suporte a "petição piloto" (petição Free)
-- Execute no Supabase SQL Editor.

ALTER TABLE public.petitions
  ADD COLUMN IF NOT EXISTS is_pilot boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.petitions.is_pilot IS 'Marca a petição piloto (petição Free) do cliente';

CREATE INDEX IF NOT EXISTS idx_petitions_client_pilot_approved
  ON public.petitions (client_id, is_pilot, status);

