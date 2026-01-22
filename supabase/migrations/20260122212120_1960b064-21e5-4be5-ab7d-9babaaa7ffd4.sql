-- Create enums for user roles, employment types, work types, and application status
CREATE TYPE public.user_role AS ENUM ('job_seeker', 'employer');
CREATE TYPE public.employment_type AS ENUM ('job', 'internship');
CREATE TYPE public.work_type AS ENUM ('remote', 'hybrid', 'on-site');
CREATE TYPE public.availability_type AS ENUM ('full-time', 'part-time', 'internship');
CREATE TYPE public.application_status AS ENUM ('applied', 'shortlisted', 'contacted');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'job_seeker',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for security (admin roles if needed later)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create job seeker profiles table
CREATE TABLE public.job_seeker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  education TEXT,
  experience TEXT,
  availability availability_type DEFAULT 'full-time',
  preferred_work_type work_type DEFAULT 'remote',
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table (employer profiles)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  employment_type employment_type NOT NULL DEFAULT 'job',
  required_skills TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  location TEXT,
  work_type work_type DEFAULT 'remote',
  internship_duration TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'applied',
  skill_match_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- Create skipped_jobs table (jobs user swiped left on)
CREATE TABLE public.skipped_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_seeker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skipped_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Job seeker profiles policies
CREATE POLICY "Job seekers can view own profile" ON public.job_seeker_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Employers can view seeker profiles for their job applications" ON public.job_seeker_profiles FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.companies c ON j.company_id = c.id
    WHERE a.seeker_id = job_seeker_profiles.user_id
    AND c.user_id = auth.uid()
  )
);
CREATE POLICY "Job seekers can insert own profile" ON public.job_seeker_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Job seekers can update own profile" ON public.job_seeker_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Companies policies
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employers can insert own company" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Employers can update own company" ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Employers can view own jobs" ON public.jobs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = jobs.company_id AND user_id = auth.uid())
);
CREATE POLICY "Employers can insert jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Employers can update own jobs" ON public.jobs FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = jobs.company_id AND user_id = auth.uid())
);

-- Applications policies
CREATE POLICY "Seekers can view own applications" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = seeker_id);
CREATE POLICY "Employers can view applications for their jobs" ON public.applications FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.id = applications.job_id AND c.user_id = auth.uid()
  )
);
CREATE POLICY "Seekers can insert applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "Employers can update application status" ON public.applications FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.id = applications.job_id AND c.user_id = auth.uid()
  )
);

-- Skipped jobs policies
CREATE POLICY "Seekers can view own skipped jobs" ON public.skipped_jobs FOR SELECT TO authenticated USING (auth.uid() = seeker_id);
CREATE POLICY "Seekers can insert skipped jobs" ON public.skipped_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = seeker_id);

-- Chats policies
CREATE POLICY "Chat participants can view chats" ON public.chats FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = chats.application_id
    AND (a.seeker_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = a.job_id AND c.user_id = auth.uid()
    ))
  )
);
CREATE POLICY "System can create chats" ON public.chats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Employers can unlock chats" ON public.chats FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.companies c ON j.company_id = c.id
    WHERE a.id = chats.application_id AND c.user_id = auth.uid()
  )
);

-- Messages policies
CREATE POLICY "Chat participants can view messages" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.chats ch
    JOIN public.applications a ON ch.application_id = a.id
    WHERE ch.id = messages.chat_id
    AND (a.seeker_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = a.job_id AND c.user_id = auth.uid()
    ))
  )
);
CREATE POLICY "Participants can send messages when chat unlocked" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats ch
    JOIN public.applications a ON ch.application_id = a.id
    WHERE ch.id = messages.chat_id
    AND ch.is_locked = false
    AND (a.seeker_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = a.job_id AND c.user_id = auth.uid()
    ))
  )
);

-- Feedback policies
CREATE POLICY "Users can insert own feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'job_seeker')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to auto-create chat when application is created
CREATE OR REPLACE FUNCTION public.handle_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.chats (application_id, is_locked)
  VALUES (NEW.id, true);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_application();

-- Create trigger to unlock chat when application status changes to 'contacted'
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'contacted' AND OLD.status != 'contacted' THEN
    UPDATE public.chats SET is_locked = false WHERE application_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_application_status_changed
  AFTER UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_status_change();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_job_seeker_profiles_updated_at BEFORE UPDATE ON public.job_seeker_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;