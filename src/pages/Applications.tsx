import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SkillBadge } from "@/components/SkillBadge";
import { MatchIndicator } from "@/components/MatchIndicator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Building2, Briefcase, Clock, CheckCircle, MessageCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  status: "applied" | "shortlisted" | "contacted";
  skill_match_percentage: number;
  created_at: string;
  job: {
    id: string;
    title: string;
    employment_type: "job" | "internship";
    required_skills: string[];
    location: string | null;
    work_type: "remote" | "hybrid" | "on-site";
    company: {
      name: string;
      logo_url: string | null;
    };
  };
}

const statusConfig = {
  applied: {
    label: "Applied",
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  shortlisted: {
    label: "Shortlisted",
    icon: CheckCircle,
    color: "text-cheer-warning",
    bgColor: "bg-cheer-warning/20",
  },
  contacted: {
    label: "Contacted",
    icon: MessageCircle,
    color: "text-cheer-success",
    bgColor: "bg-cheer-success/20",
  },
};

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "applied" | "shortlisted" | "contacted">("all");

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs(
          id,
          title,
          employment_type,
          required_skills,
          location,
          work_type,
          company:companies(name, logo_url)
        )
      `)
      .eq("seeker_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      return;
    }

    setApplications(data as Application[]);
    setLoading(false);
  };

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter((app) => app.status === filter);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="font-display text-3xl font-bold mb-6">My Applications</h1>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="applied">
              Applied ({applications.filter((a) => a.status === "applied").length})
            </TabsTrigger>
            <TabsTrigger value="shortlisted">
              Shortlisted ({applications.filter((a) => a.status === "shortlisted").length})
            </TabsTrigger>
            <TabsTrigger value="contacted">
              Contacted ({applications.filter((a) => a.status === "contacted").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">No Applications Yet</h2>
            <p className="text-muted-foreground">
              Start swiping on jobs to build your application list!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application, index) => {
              const status = statusConfig[application.status];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
                      {application.job.company.logo_url ? (
                        <img
                          src={application.job.company.logo_url}
                          alt={application.job.company.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-primary" />
                      )}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg truncate">{application.job.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {application.job.company.name}
                          </p>
                        </div>
                        <MatchIndicator percentage={application.skill_match_percentage} size="sm" />
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium uppercase",
                            status.bgColor,
                            status.color
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span className="text-muted-foreground capitalize">
                          {application.job.employment_type}
                        </span>
                        <span className="text-muted-foreground capitalize">
                          {application.job.work_type}
                        </span>
                        {application.job.location && (
                          <span className="text-muted-foreground">{application.job.location}</span>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {application.job.required_skills.slice(0, 5).map((skill) => (
                          <SkillBadge key={skill} skill={skill} size="sm" />
                        ))}
                        {application.job.required_skills.length > 5 && (
                          <span className="text-xs text-muted-foreground self-center">
                            +{application.job.required_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
