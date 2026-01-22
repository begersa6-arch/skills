import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

export default function Profile() {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="glass-card p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">{profile?.display_name}</h1>
          <p className="text-muted-foreground">{profile?.email}</p>
        </div>
      </div>
    </Layout>
  );
}
