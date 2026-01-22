import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Building2, Search, MapPin, Briefcase, Loader2 } from "lucide-react";
import { INDUSTRIES } from "@/lib/constants";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  description: string | null;
  logo_url: string | null;
  job_count: number;
}

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select(`
        *,
        jobs(id)
      `);

    if (error) {
      console.error("Error fetching companies:", error);
      return;
    }

    const companiesWithCounts = data.map((company) => ({
      ...company,
      job_count: company.jobs?.length || 0,
    }));

    setCompanies(companiesWithCounts);
    setLoading(false);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.industry?.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-6">Explore Companies</h1>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedIndustry(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedIndustry
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {INDUSTRIES.slice(0, 6).map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedIndustry === industry
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">No Companies Found</h2>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <motion.button
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/companies/${company.id}`)}
                className="glass-card p-6 text-left hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition-shadow"
              >
                {/* Logo & Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Building2 className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    {company.industry && (
                      <p className="text-sm text-muted-foreground">{company.industry}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {company.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {company.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {company.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {company.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {company.job_count} {company.job_count === 1 ? "job" : "jobs"}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
