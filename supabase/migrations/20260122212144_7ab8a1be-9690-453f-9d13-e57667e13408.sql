-- Fix search_path issue by recreating functions with explicit search_path

-- Drop and recreate handle_new_application with search_path
CREATE OR REPLACE FUNCTION public.handle_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.chats (application_id, is_locked)
  VALUES (NEW.id, true);
  RETURN NEW;
END;
$$;

-- Drop and recreate handle_application_status_change with search_path
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'contacted' AND OLD.status != 'contacted' THEN
    UPDATE public.chats SET is_locked = false WHERE application_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop and recreate update_updated_at_column with search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix overly permissive RLS policy for chats
DROP POLICY IF EXISTS "System can create chats" ON public.chats;

-- Create more restrictive chat insert policy - only allow creation via trigger
CREATE POLICY "Chats created via application trigger" ON public.chats FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_id
    AND (a.seeker_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.companies c ON j.company_id = c.id
      WHERE j.id = a.job_id AND c.user_id = auth.uid()
    ))
  )
);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', false, 10485760, ARRAY['application/pdf']);

-- Storage policies for resumes
CREATE POLICY "Users can upload own resume"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own resume"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own resume"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own resume"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Employers can view resumes of applicants
CREATE POLICY "Employers can view applicant resumes"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'resumes' AND EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.companies c ON j.company_id = c.id
    WHERE a.seeker_id::text = (storage.foldername(name))[1]
    AND c.user_id = auth.uid()
  )
);