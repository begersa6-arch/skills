import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Briefcase, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Briefcase,
      title: "Swipe to Apply",
      description: "Discover jobs and internships with a simple swipe interface. Right to apply, left to skip.",
    },
    {
      icon: Users,
      title: "Skill-Based Matching",
      description: "Our transparent matching algorithm connects you with opportunities that fit your skills.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your application status and get notified when employers are interested.",
    },
    {
      icon: Sparkles,
      title: "Fair Hiring",
      description: "Skills-first approach ensures everyone gets a fair chance at their dream opportunity.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Jobs" },
    { value: "5K+", label: "Companies" },
    { value: "50K+", label: "Job Seekers" },
    { value: "85%", label: "Match Rate" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 animated-gradient opacity-50" />
      
      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
        <Logo size="md" />
        <Link to="/auth">
          <Button variant="outline">Sign In</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Perfect{" "}
            <span className="text-primary glow-text">Career Match</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Swipe, match, and connect with opportunities that align with your skills. 
            The fairer way to find jobs and internships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?role=job_seeker">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Find Jobs <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth?role=employer">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Hire Talent
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating Cards Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative mt-16 max-w-lg mx-auto"
        >
          <div className="absolute -top-4 -left-4 w-64 glass-card p-4 rotate-[-8deg] float">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/30" />
              <div>
                <div className="h-3 w-24 bg-foreground/30 rounded" />
                <div className="h-2 w-16 bg-muted-foreground/30 rounded mt-1" />
              </div>
            </div>
            <div className="h-2 w-full bg-muted/50 rounded" />
            <div className="h-2 w-3/4 bg-muted/50 rounded mt-1" />
          </div>
          
          <div className="glass-card p-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Senior Developer</h3>
                <p className="text-muted-foreground">TechCorp Inc.</p>
              </div>
              <div className="ml-auto">
                <span className="text-cheer-success font-bold">92%</span>
                <p className="text-xs text-muted-foreground">Match</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="skill-badge">React</span>
              <span className="skill-badge">TypeScript</span>
              <span className="skill-badge">Node.js</span>
            </div>
          </div>
          
          <div className="absolute -bottom-4 -right-4 w-48 glass-card p-3 rotate-[5deg] float" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cheer-success" />
              <span className="text-sm font-medium">Application Sent!</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 border-y border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="font-display text-4xl md:text-5xl font-bold text-primary glow-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-primary">CHEER</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're revolutionizing how people find jobs with transparency, fairness, and a touch of fun.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers and employers finding their perfect match every day.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-border/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-muted-foreground text-sm">
            © 2024 CHEER. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
