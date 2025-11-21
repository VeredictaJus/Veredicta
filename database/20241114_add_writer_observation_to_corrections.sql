-- Adds writer_observation field so writers can send notes to admins
ALTER TABLE corrections
ADD COLUMN IF NOT EXISTS writer_observation text;


