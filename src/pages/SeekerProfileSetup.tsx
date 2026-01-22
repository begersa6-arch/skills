import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Loader2, Upload, X, Check } from "lucide-react";
import { toast } from "sonner";
import { SKILLS_LIST } from "@/lib/constants";
import { SkillBadge } from "@/components/SkillBadge";

export default function SeekerProfileSetup() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.display_name || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState<"full-time" | "part-time" | "internship">("full-time");
  const [workType, setWorkType] = useState<"remote" | "hybrid" | "on-site">("remote");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skillSearch, setSkillSearch] = useState("");

  const filteredSkills = SKILLS_LIST.filter(
    (skill) =>
      skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.includes(skill)
  );

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else if (selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, skill]);
    } else {
      toast.error("Maximum 10 skills allowed");
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let resumeUrl = null;

      // Upload resume if provided
      if (resumeFile) {
        const fileName = `${user.id}/${Date.now()}_resume.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(fileName);
        
        resumeUrl = urlData.publicUrl;
      }

      // Create job seeker profile
      const { error } = await supabase.from("job_seeker_profiles").insert({
        user_id: user.id,
        full_name: fullName,
        skills: selectedSkills,
        education,
        experience,
        availability,
        preferred_work_type: workType,
        resume_url: resumeUrl,
      });

      if (error) throw error;

      toast.success("Profile created successfully!");
      navigate("/discover");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo size="sm" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Let's set up your profile</h1>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="education">Education (Optional)</Label>
                <Textarea
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g., BS Computer Science, Stanford University, 2023"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience (Optional)</Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g., 2 years as a Frontend Developer at Tech Corp"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!fullName.trim()}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">What are your skills?</h1>
              <p className="text-muted-foreground">Select up to 10 skills that best represent you</p>
            </div>

            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="glass-card p-4">
                <Label className="mb-3 block">Selected Skills ({selectedSkills.length}/10)</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary/30 text-primary-foreground border border-primary/50 hover:bg-primary/40 transition-colors"
                    >
                      {skill}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Search */}
            <div>
              <Input
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />
            </div>

            {/* Available Skills */}
            <div className="max-h-64 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {filteredSkills.slice(0, 20).map((skill) => (
                  <SkillBadge
                    key={skill}
                    skill={skill}
                    onClick={() => toggleSkill(skill)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setStep(1)} variant="outline" size="lg" className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                variant="hero"
                size="lg"
                className="flex-1"
                disabled={selectedSkills.length === 0}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Almost there!</h1>
              <p className="text-muted-foreground">Set your preferences and upload your resume</p>
            </div>

            {/* Availability */}
            <div>
              <Label className="mb-3 block">Availability</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["full-time", "part-time", "internship"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAvailability(type)}
                    className={`glass-card p-4 text-center transition-all ${
                      availability === type
                        ? "ring-2 ring-primary"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <span className="capitalize">{type.replace("-", " ")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Work Type */}
            <div>
              <Label className="mb-3 block">Preferred Work Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["remote", "hybrid", "on-site"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setWorkType(type)}
                    className={`glass-card p-4 text-center transition-all ${
                      workType === type
                        ? "ring-2 ring-primary"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <Label className="mb-3 block">Resume (PDF)</Label>
              <div
                className={`glass-card p-8 text-center border-2 border-dashed transition-colors ${
                  resumeFile ? "border-cheer-success" : "border-border"
                }`}
              >
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <Check className="w-6 h-6 text-cheer-success" />
                    <span>{resumeFile.name}</span>
                    <button
                      onClick={() => setResumeFile(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Click to upload PDF</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setStep(2)} variant="outline" size="lg" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                variant="hero"
                size="lg"
                className="flex-1"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Setup"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
