import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/SkillBadge";
import { MatchIndicator } from "@/components/MatchIndicator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, Heart, MapPin, Building2, Briefcase, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { calculateSkillMatch } from "@/lib/constants";
import { CompanyPopup } from "@/components/CompanyPopup";

interface Job {
  id: string;
  title: string;
  employment_type: "job" | "internship";
  required_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  work_type: "remote" | "hybrid" | "on-site";
  internship_duration: string | null;
  description: string | null;
  company: {
    id: string;
    name: string;
    industry: string | null;
    location: string | null;
    description: string | null;
    logo_url: string | null;
  };
}

interface SeekerProfile {
  skills: string[];
}

export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [seekerProfile, setSeekerProfile] = useState<SeekerProfile | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Job["company"] | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  useEffect(() => {
    if (user) {
      fetchSeekerProfile();
    }
  }, [user]);

  useEffect(() => {
    if (seekerProfile) {
      fetchJobs();
    }
  }, [seekerProfile]);

  const fetchSeekerProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("job_seeker_profiles")
      .select("skills")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (!data) {
      // Redirect to profile setup if no profile exists
      navigate("/profile/setup");
      return;
    }

    setSeekerProfile(data);
  };

  const fetchJobs = async () => {
    if (!user) return;

    // Get jobs that user hasn't applied to or skipped
    const { data: appliedJobs } = await supabase
      .from("applications")
      .select("job_id")
      .eq("seeker_id", user.id);

    const { data: skippedJobs } = await supabase
      .from("skipped_jobs")
      .select("job_id")
      .eq("seeker_id", user.id);

    const excludedJobIds = [
      ...(appliedJobs?.map((a) => a.job_id) || []),
      ...(skippedJobs?.map((s) => s.job_id) || []),
    ];

    let query = supabase
      .from("jobs")
      .select(`
        *,
        company:companies(id, name, industry, location, description, logo_url)
      `)
      .eq("is_active", true);

    if (excludedJobIds.length > 0) {
      query = query.not("id", "in", `(${excludedJobIds.join(",")})`);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Error fetching jobs:", error);
      return;
    }

    setJobs(data as Job[]);
    setLoading(false);
  };

  const handleSwipe = async (direction: "left" | "right") => {
    if (swiping || currentIndex >= jobs.length) return;
    setSwiping(true);

    const job = jobs[currentIndex];

    try {
      if (direction === "right") {
        // Apply to job
        const matchPercentage = calculateSkillMatch(
          seekerProfile?.skills || [],
          job.required_skills
        );

        const { error } = await supabase.from("applications").insert({
          job_id: job.id,
          seeker_id: user?.id,
          skill_match_percentage: matchPercentage,
        });

        if (error) throw error;
        toast.success("Application sent!");
      } else {
        // Skip job
        const { error } = await supabase.from("skipped_jobs").insert({
          job_id: job.id,
          seeker_id: user?.id,
        });

        if (error) throw error;
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to process");
    } finally {
      setSwiping(false);
      x.set(0);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleSwipe("right");
    } else if (info.offset.x < -100) {
      handleSwipe("left");
    }
  };

  const currentJob = jobs[currentIndex];
  const matchPercentage = currentJob
    ? calculateSkillMatch(seekerProfile?.skills || [], currentJob.required_skills)
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!currentJob) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Briefcase className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">No More Jobs</h2>
          <p className="text-muted-foreground mb-6">
            You've seen all available jobs. Check back later for new opportunities!
          </p>
          <Button onClick={() => navigate("/applications")} variant="hero">
            View Applications
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Swipe Card */}
        <div className="relative h-[500px]">
          <motion.div
            className="absolute inset-0 swipe-card"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            {/* Company Info */}
            <button
              onClick={() => setSelectedCompany(currentJob.company)}
              className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                {currentJob.company.logo_url ? (
                  <img
                    src={currentJob.company.logo_url}
                    alt={currentJob.company.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <div className="font-medium">{currentJob.company.name}</div>
                <div className="text-sm text-muted-foreground">{currentJob.company.industry}</div>
              </div>
              <div className="ml-auto">
                <MatchIndicator percentage={matchPercentage} size="sm" />
              </div>
            </button>

            {/* Job Title */}
            <h2 className="font-display text-2xl font-bold mb-2">{currentJob.title}</h2>

            {/* Job Type Badge */}
            <div className="flex gap-2 mb-4">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary border border-primary/30 uppercase">
                {currentJob.employment_type}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground capitalize">
                {currentJob.work_type}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 text-sm">
              {currentJob.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {currentJob.location}
                </div>
              )}
              {(currentJob.salary_min || currentJob.salary_max) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  {currentJob.salary_min && currentJob.salary_max
                    ? `$${currentJob.salary_min.toLocaleString()} - $${currentJob.salary_max.toLocaleString()}`
                    : currentJob.salary_min
                    ? `From $${currentJob.salary_min.toLocaleString()}`
                    : `Up to $${currentJob.salary_max?.toLocaleString()}`}
                  {currentJob.employment_type === "internship" ? "/mo" : "/yr"}
                </div>
              )}
            </div>

            {/* Description */}
            {currentJob.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {currentJob.description}
              </p>
            )}

            {/* Skills */}
            <div>
              <div className="text-sm font-medium mb-2">Required Skills</div>
              <div className="flex flex-wrap gap-2">
                {currentJob.required_skills.map((skill) => (
                  <SkillBadge
                    key={skill}
                    skill={skill}
                    size="sm"
                    isMatched={seekerProfile?.skills.some(
                      (s) => s.toLowerCase() === skill.toLowerCase()
                    )}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-8 mt-8">
          <Button
            variant="swipeLeft"
            size="iconLg"
            className="rounded-full"
            onClick={() => handleSwipe("left")}
            disabled={swiping}
          >
            <X className="w-8 h-8" />
          </Button>
          <Button
            variant="swipeRight"
            size="iconLg"
            className="rounded-full"
            onClick={() => handleSwipe("right")}
            disabled={swiping}
          >
            <Heart className="w-8 h-8" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {currentIndex + 1} of {jobs.length} jobs
        </div>
      </div>

      {/* Company Popup */}
      <CompanyPopup
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />
    </Layout>
  );
}
