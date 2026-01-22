import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Briefcase, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();

  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") !== "signin");
  const [selectedRole, setSelectedRole] = useState<"job_seeker" | "employer">(
    (searchParams.get("role") as "job_seeker" | "employer") || "job_seeker"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, selectedRole, name);
        // Navigate to setup page based on role
        if (selectedRole === "employer") {
          navigate("/employer/setup");
        } else {
          navigate("/profile/setup");
        }
      } else {
        await signIn(email, password);
        navigate("/discover");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 relative animated-gradient items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-lg"
        >
          <Logo size="lg" className="mb-8" />
          <h1 className="font-display text-4xl font-bold mb-4">
            {isSignUp ? "Join the Revolution" : "Welcome Back"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isSignUp
              ? "Create an account and start your journey towards a fairer, skill-based hiring experience."
              : "Sign in to continue your job search or manage your postings."}
          </p>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Link to="/">
              <Logo size="md" />
            </Link>
          </div>

          <h2 className="font-display text-3xl font-bold mb-2">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? "Fill in your details to get started"
              : "Enter your credentials to continue"}
          </p>

          {/* Role Selection (only for sign up) */}
          {isSignUp && (
            <div className="mb-6">
              <Label className="mb-3 block">I am a...</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole("job_seeker")}
                  className={`glass-card p-4 text-left transition-all ${
                    selectedRole === "job_seeker"
                      ? "ring-2 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <Briefcase
                    className={`w-8 h-8 mb-2 ${
                      selectedRole === "job_seeker" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="font-semibold">Job Seeker</div>
                  <div className="text-sm text-muted-foreground">Looking for opportunities</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("employer")}
                  className={`glass-card p-4 text-left transition-all ${
                    selectedRole === "employer"
                      ? "ring-2 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <Building2
                    className={`w-8 h-8 mb-2 ${
                      selectedRole === "employer" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="font-semibold">Employer</div>
                  <div className="text-sm text-muted-foreground">Hiring talent</div>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <span className="text-primary font-medium">Sign in</span>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <span className="text-primary font-medium">Sign up</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
