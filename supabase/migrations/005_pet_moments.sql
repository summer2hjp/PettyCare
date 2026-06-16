-- supabase/migrations/005_pet_moments.sql
-- Pet Moments table for Dashboard photo galleries

CREATE TABLE pet_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  moment_type TEXT NOT NULL CHECK (moment_type IN ('daily', 'interaction', 'growth')),
  taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pet_moments_pet_type ON pet_moments(pet_id, moment_type);
CREATE INDEX idx_pet_moments_pet_date ON pet_moments(pet_id, taken_at DESC);

ALTER TABLE pet_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their household's pet moments" ON pet_moments
  FOR SELECT USING (public.can_access_pet(pet_id));

CREATE POLICY "Users can insert their household's pet moments" ON pet_moments
  FOR INSERT WITH CHECK (public.can_access_pet(pet_id));

CREATE POLICY "Users can update their household's pet moments" ON pet_moments
  FOR UPDATE USING (public.can_access_pet(pet_id))
  WITH CHECK (public.can_access_pet(pet_id));

CREATE POLICY "Users can delete their household's pet moments" ON pet_moments
  FOR DELETE USING (public.can_access_pet(pet_id));
