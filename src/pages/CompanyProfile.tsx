import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/SkillBadge";
import { MatchIndicator } from "@/components/MatchIndicator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  ArrowLeft,
  Briefcase,
  DollarSign,
  Loader2,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { calculateSkillMatch } from "@/lib/constants";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  description: string | null;
  logo_url: string | null;
}

interface Job {
  id: string;
  title: string;
  employment_type: "job" | "internship";
  required_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  work_type: "remote" | "hybrid" | "on-site";
  description: string | null;
}

interface SeekerProfile {
  skills: string[];
}

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [seekerProfile, setSeekerProfile] = useState<SeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchCompany();
    if (profile?.role === "job_seeker") {
      fetchSeekerProfile();
    }
  }, [id, profile]);

  const fetchCompany = async () => {
    if (!id) return;

    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (companyError || !companyData) {
      console.error("Error fetching company:", companyError);
      navigate("/companies");
      return;
    }

    setCompany(companyData);

    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", id)
      .eq("is_active", true);

    setJobs(jobsData || []);
    setLoading(false);
  };

  const fetchSeekerProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("job_seeker_profiles")
      .select("skills")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setSeekerProfile(data);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user || !seekerProfile) return;
    setApplying(jobId);

    try {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;

      const matchPercentage = calculateSkillMatch(seekerProfile.skills, job.required_skills);

      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        seeker_id: user.id,
        skill_match_percentage: matchPercentage,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You've already applied to this job");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Application sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <Building2 className="w-12 h-12 text-primary" />
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                {company.industry && <span>{company.industry}</span>}
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {company.description && (
            <p className="text-muted-foreground mt-6">{company.description}</p>
          )}
        </motion.div>

        {/* Jobs */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-6">
            Open Positions ({jobs.length})
          </h2>

          {jobs.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No open positions at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => {
                const matchPercentage = seekerProfile
                  ? calculateSkillMatch(seekerProfile.skills, job.required_skills)
                  : 0;

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-xl mb-1">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/20 text-primary border border-primary/30 uppercase">
                            {job.employment_type}
                          </span>
                          <span className="text-muted-foreground capitalize">{job.work_type}</span>
                          {job.location && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                          )}
                          {(job.salary_min || job.salary_max) && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {job.salary_min && job.salary_max
                                ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                                : job.salary_min
                                ? `From $${job.salary_min.toLocaleString()}`
                                : `Up to $${job.salary_max?.toLocaleString()}`}
                            </span>
                          )}
                        </div>
                      </div>
                      {seekerProfile && <MatchIndicator percentage={matchPercentage} size="sm" />}
                    </div>

                    {job.description && (
                      <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.slice(0, 5).map((skill) => (
                          <SkillBadge
                            key={skill}
                            skill={skill}
                            size="sm"
                            isMatched={seekerProfile?.skills.some(
                              (s) => s.toLowerCase() === skill.toLowerCase()
                            )}
                          />
                        ))}
                        {job.required_skills.length > 5 && (
                          <span className="text-xs text-muted-foreground self-center">
                            +{job.required_skills.length - 5} more
                          </span>
                        )}
                      </div>

                      {profile?.role === "job_seeker" && (
                        <Button
                          variant="swipeRight"
                          onClick={() => handleApply(job.id)}
                          disabled={applying === job.id}
                        >
                          {applying === job.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Heart className="w-4 h-4" />
                              Apply
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
