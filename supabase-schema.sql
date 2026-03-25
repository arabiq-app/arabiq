-- ============================================================
-- ARABIQ DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  level TEXT DEFAULT 'Beginner',
  dialect TEXT DEFAULT 'Modern Standard Arabic',
  plan TEXT DEFAULT 'None',
  streak INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  sessions_left INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  joined TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  origin TEXT,
  speciality TEXT,
  bio TEXT,
  avatar TEXT,
  accent_color TEXT DEFAULT '#1A3470',
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  students INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 35,
  languages TEXT[] DEFAULT ARRAY['English'],
  levels TEXT[] DEFAULT ARRAY['Beginner'],
  slots TEXT[] DEFAULT ARRAY[]::TEXT[],
  available BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending',
  verified BOOLEAN DEFAULT false,
  docs_submitted BOOLEAN DEFAULT false,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  teacher_avatar TEXT,
  teacher_accent TEXT,
  slot TEXT NOT NULL,
  session_type TEXT NOT NULL,
  topic TEXT,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'confirmed',
  whereby_room_url TEXT,
  whereby_host_room_url TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'gbp',
  platform_fee DECIMAL(10,2),
  teacher_payout DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  topic TEXT,
  duration_minutes INTEGER DEFAULT 55,
  teacher_notes TEXT,
  student_rating INTEGER,
  student_feedback TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ISSUES TABLE
CREATE TABLE IF NOT EXISTS public.issues (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  type TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to TEXT DEFAULT 'Unassigned',
  messages INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOCABULARY TABLE
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  arabic TEXT NOT NULL,
  english TEXT NOT NULL,
  transliteration TEXT,
  mastered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = auth_id);

-- Teachers policies
CREATE POLICY "teachers_select_approved" ON public.teachers FOR SELECT USING (status = 'approved');

-- Bookings policies
CREATE POLICY "bookings_select_own" ON public.bookings FOR SELECT USING (
  student_email = auth.email() OR
  user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "bookings_insert_any" ON public.bookings FOR INSERT WITH CHECK (true);

-- Payments policies
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (
  user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "payments_insert_any" ON public.payments FOR INSERT WITH CHECK (true);

-- Sessions policies
CREATE POLICY "sessions_select_own" ON public.sessions FOR SELECT USING (
  user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Issues policies
CREATE POLICY "issues_insert_any" ON public.issues FOR INSERT WITH CHECK (true);
CREATE POLICY "issues_select_own" ON public.issues FOR SELECT USING (user_email = auth.email());

-- Vocabulary policies
CREATE POLICY "vocab_all_own" ON public.vocabulary FOR ALL USING (
  user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- ============================================================
-- SEED TEACHERS
-- ============================================================
INSERT INTO public.teachers (name, email, origin, speciality, bio, avatar, accent_color, rating, reviews, students, total_sessions, price, languages, levels, slots, available, status, verified, docs_submitted)
VALUES
  ('Fatima Al-Rashid', 'fatima@arabiq.app', 'Cairo, Egypt', 'Modern Standard Arabic',
   'Oxford-trained linguist with 8 years teaching MSA and Quranic Arabic to international students.',
   'FA', '#1A3470', 4.98, 214, 312, 1240, 35,
   ARRAY['English','French'], ARRAY['Beginner','Intermediate'],
   ARRAY['Mon 9:00 AM','Mon 2:00 PM','Tue 10:00 AM','Wed 11:00 AM','Thu 3:00 PM','Fri 9:00 AM'],
   true, 'approved', true, true),
  ('Omar Khalil', 'omar@arabiq.app', 'Beirut, Lebanon', 'Levantine Dialect',
   'Award-winning author and language coach specialising in conversational Levantine Arabic for professionals.',
   'OK', '#0D2855', 4.95, 189, 276, 890, 42,
   ARRAY['English','German'], ARRAY['Intermediate','Advanced'],
   ARRAY['Mon 11:00 AM','Tue 2:00 PM','Wed 4:00 PM','Thu 10:00 AM','Fri 2:00 PM'],
   true, 'approved', true, true),
  ('Nour Hassan', 'nour@arabiq.app', 'Tunis, Tunisia', 'Quranic Arabic',
   'Islamic scholar and certified Tajweed instructor, helping students connect with the Quran through language.',
   'NH', '#2A4A8A', 4.97, 143, 198, 620, 30,
   ARRAY['English','Arabic'], ARRAY['Beginner'],
   ARRAY[]::TEXT[], false, 'approved', true, true),
  ('Yasmin Tariq', 'yasmin@arabiq.app', 'Dubai, UAE', 'Gulf Arabic',
   'Business Arabic specialist with clients at Fortune 500 companies. Pragmatic, results-driven teaching style.',
   'YT', '#122860', 4.99, 267, 401, 1580, 50,
   ARRAY['English'], ARRAY['Beginner','Intermediate','Advanced'],
   ARRAY['Mon 10:00 AM','Tue 9:00 AM','Wed 3:00 PM','Thu 11:00 AM','Fri 10:00 AM','Fri 4:00 PM'],
   true, 'approved', true, true)
ON CONFLICT (email) DO NOTHING;
