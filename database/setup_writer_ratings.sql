-- Create writer ratings table
CREATE TABLE IF NOT EXISTS app_2d8133c678_writer_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  writer_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES auth.users NOT NULL,
  petition_id UUID REFERENCES app_2d8133c678_petitions NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_writer_ratings_writer_id ON app_2d8133c678_writer_ratings(writer_id);
CREATE INDEX IF NOT EXISTS idx_writer_ratings_client_id ON app_2d8133c678_writer_ratings(client_id);
CREATE INDEX IF NOT EXISTS idx_writer_ratings_petition_id ON app_2d8133c678_writer_ratings(petition_id);
CREATE INDEX IF NOT EXISTS idx_writer_ratings_created_at ON app_2d8133c678_writer_ratings(created_at DESC);

-- Ensure one rating per petition per client (prevent duplicate ratings)
ALTER TABLE app_2d8133c678_writer_ratings ADD CONSTRAINT unique_client_petition_rating 
  UNIQUE (client_id, petition_id);

-- Setup Row Level Security (RLS)
ALTER TABLE app_2d8133c678_writer_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow clients to insert ratings for their own petitions
CREATE POLICY "allow_clients_insert_own_ratings" ON app_2d8133c678_writer_ratings
  FOR INSERT TO authenticated 
  WITH CHECK (
    client_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM app_2d8133c678_petitions 
      WHERE id = petition_id AND client_id = auth.uid() AND status = 'completed'
    )
  );

-- Policy: Allow writers to read their own ratings
CREATE POLICY "allow_writers_read_own_ratings" ON app_2d8133c678_writer_ratings
  FOR SELECT TO authenticated
  USING (writer_id = auth.uid());

-- Policy: Allow clients to read ratings they submitted
CREATE POLICY "allow_clients_read_own_ratings" ON app_2d8133c678_writer_ratings
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

-- Policy: Allow everyone to read ratings for transparency (optional - remove if not desired)
CREATE POLICY "allow_public_read_ratings" ON app_2d8133c678_writer_ratings
  FOR SELECT TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_writer_ratings_updated_at BEFORE UPDATE
    ON app_2d8133c678_writer_ratings FOR EACH ROW EXECUTE FUNCTION
    update_updated_at_column();

-- Create function to get writer rating stats
CREATE OR REPLACE FUNCTION get_writer_rating_stats(writer_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT JSON_BUILD_OBJECT(
    'average_rating', COALESCE(ROUND(AVG(rating::NUMERIC), 1), 0),
    'total_ratings', COUNT(*),
    'rating_distribution', JSON_OBJECT_AGG(rating, rating_count)
  ) INTO stats
  FROM (
    SELECT 
      rating,
      COUNT(*) as rating_count
    FROM app_2d8133c678_writer_ratings 
    WHERE writer_id = writer_uuid
    GROUP BY rating
  ) rating_counts;
  
  RETURN COALESCE(stats, '{"average_rating": 0, "total_ratings": 0, "rating_distribution": {}}'::JSON);
END;
$$ LANGUAGE plpgsql;