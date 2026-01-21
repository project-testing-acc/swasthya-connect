-- =============================================
-- SWASTHYA SLOTS DATABASE SCHEMA
-- =============================================

-- 1. ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'patient', 'doctor', 'lab_admin');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'no_show', 'completed');
CREATE TYPE public.appointment_type AS ENUM ('in_person', 'teleconsultation');
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE public.lab_order_status AS ENUM ('ordered', 'sample_collected', 'processing', 'completed', 'cancelled');

-- 2. PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'hi', 'gu')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. USER ROLES TABLE (separate from profiles for security)
-- =============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'patient',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. SPECIALTIES TABLE
-- =============================================
CREATE TABLE public.specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    name_gu TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view specialties" ON public.specialties
    FOR SELECT USING (true);

-- 5. CLINICS TABLE
-- =============================================
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT DEFAULT 'Gujarat',
    pincode TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    image_url TEXT,
    consultation_fee INTEGER NOT NULL DEFAULT 500,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    average_rating DECIMAL(2, 1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active clinics" ON public.clinics
    FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage own clinic" ON public.clinics
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all clinics" ON public.clinics
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. CLINIC SPECIALTIES JUNCTION
-- =============================================
CREATE TABLE public.clinic_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    specialty_id UUID REFERENCES public.specialties(id) ON DELETE CASCADE NOT NULL,
    UNIQUE (clinic_id, specialty_id)
);

ALTER TABLE public.clinic_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clinic specialties" ON public.clinic_specialties
    FOR SELECT USING (true);

-- 7. DOCTORS TABLE
-- =============================================
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    qualification TEXT,
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    image_url TEXT,
    consultation_duration INTEGER DEFAULT 15, -- minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active doctors" ON public.doctors
    FOR SELECT USING (is_active = true);

CREATE POLICY "Doctors can update own profile" ON public.doctors
    FOR UPDATE USING (auth.uid() = user_id);

-- 8. TIME SLOTS TABLE (available slots for doctors)
-- =============================================
CREATE TABLE public.time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view time slots" ON public.time_slots
    FOR SELECT USING (true);

-- 9. APPOINTMENTS TABLE
-- =============================================
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type appointment_type NOT NULL DEFAULT 'in_person',
    status appointment_status NOT NULL DEFAULT 'pending',
    token_number INTEGER,
    notes TEXT,
    cancellation_reason TEXT,
    fee INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own pending appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = patient_id AND status IN ('pending', 'confirmed'));

CREATE POLICY "Doctors can view clinic appointments" ON public.appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.user_id = auth.uid() AND d.clinic_id = appointments.clinic_id
        )
    );

-- 10. PAYMENTS TABLE
-- =============================================
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    amount INTEGER NOT NULL, -- in paise
    currency TEXT DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'pending',
    gateway TEXT DEFAULT 'razorpay',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. LABS TABLE
-- =============================================
CREATE TABLE public.labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT DEFAULT 'Gujarat',
    pincode TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    image_url TEXT,
    home_collection BOOLEAN DEFAULT true,
    home_collection_fee INTEGER DEFAULT 50,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    average_rating DECIMAL(2, 1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active labs" ON public.labs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage own lab" ON public.labs
    FOR ALL USING (auth.uid() = owner_id);

-- 12. LAB TESTS TABLE
-- =============================================
CREATE TABLE public.lab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES public.labs(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    description TEXT,
    price INTEGER NOT NULL, -- in paise
    tat_hours INTEGER DEFAULT 24, -- turnaround time
    sample_type TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tests" ON public.lab_tests
    FOR SELECT USING (is_active = true);

-- 13. LAB ORDERS TABLE
-- =============================================
CREATE TABLE public.lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    lab_id UUID REFERENCES public.labs(id) ON DELETE SET NULL NOT NULL,
    test_id UUID REFERENCES public.lab_tests(id) ON DELETE SET NULL NOT NULL,
    status lab_order_status NOT NULL DEFAULT 'ordered',
    sample_collection_date DATE,
    sample_collection_time TIME,
    is_home_collection BOOLEAN DEFAULT false,
    collection_address TEXT,
    report_file_key TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own orders" ON public.lab_orders
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create orders" ON public.lab_orders
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- 14. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 15. REVIEWS TABLE
-- =============================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES public.labs(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT review_target CHECK (
        (clinic_id IS NOT NULL AND lab_id IS NULL) OR
        (clinic_id IS NULL AND lab_id IS NOT NULL)
    )
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 16. HELPER FUNCTIONS
-- =============================================

-- Auto-create profile and role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Generate token number for appointments
CREATE OR REPLACE FUNCTION public.generate_token_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT COALESCE(MAX(token_number), 0) + 1 INTO NEW.token_number
  FROM public.appointments
  WHERE clinic_id = NEW.clinic_id
    AND appointment_date = NEW.appointment_date;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_appointment_token
  BEFORE INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.generate_token_number();