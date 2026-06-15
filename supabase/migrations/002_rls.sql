-- supabase/migrations/002_rls.sql
-- Row Level Security policies + auto-create on signup

-- 0. Helper functions
CREATE OR REPLACE FUNCTION public.user_households()
RETURNS SETOF UUID
LANGUAGE sql STABLE
AS $$
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.can_access_pet(check_pet_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = check_pet_id
    AND p.household_id IN (SELECT public.user_households())
  )
$$;

-- 1. Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- 2. Households
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can view their households"
  ON households FOR SELECT
  USING (id IN (SELECT public.user_households()));
CREATE POLICY "members can create households"
  ON households FOR INSERT
  WITH CHECK (true);

-- 3. Household members
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can view household members"
  ON household_members FOR SELECT
  USING (household_id IN (SELECT public.user_households()));
CREATE POLICY "admins can insert members"
  ON household_members FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "admins can update members"
  ON household_members FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "admins can delete members"
  ON household_members FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Pets
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage household pets"
  ON pets FOR ALL
  USING (household_id IN (SELECT public.user_households()))
  WITH CHECK (household_id IN (SELECT public.user_households()));

-- 5-11. Health records, activity, feeding, appointments, reminders
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage vaccinations"
  ON vaccinations FOR ALL
  USING (public.can_access_pet(pet_id))
  WITH CHECK (public.can_access_pet(pet_id));

ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage vet_visits"
  ON vet_visits FOR ALL
  USING (public.can_access_pet(pet_id))
  WITH CHECK (public.can_access_pet(pet_id));

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage medications"
  ON medications FOR ALL
  USING (public.can_access_pet(pet_id))
  WITH CHECK (public.can_access_pet(pet_id));

ALTER TABLE activity_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage activity_records"
  ON activity_records FOR ALL
  USING (public.can_access_pet(pet_id))
  WITH CHECK (public.can_access_pet(pet_id));

ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage feeding_records"
  ON feeding_records FOR ALL
  USING (public.can_access_pet(pet_id))
  WITH CHECK (public.can_access_pet(pet_id));

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage appointments"
  ON appointments FOR ALL
  USING (public.can_access_pet(pet_id))
  WITH CHECK (public.can_access_pet(pet_id));

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage reminders"
  ON reminders FOR ALL
  USING (public.can_access_pet(pet_id))
  WITH CHECK (public.can_access_pet(pet_id));

-- 12. Auth trigger: auto-create profile + default household on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  default_household_id UUID;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));

  INSERT INTO public.households (name)
  VALUES (COALESCE(NEW.email, 'User') || '''s Household')
  RETURNING id INTO default_household_id;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (default_household_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
