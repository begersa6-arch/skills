import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, ArrowRight } from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  description: string | null;
  logo_url: string | null;
}

interface CompanyPopupProps {
  company: Company | null;
  onClose: () => void;
}

export function CompanyPopup({ company, onClose }: CompanyPopupProps) {
  const navigate = useNavigate();

  if (!company) return null;

  return (
    <Dialog open={!!company} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Building2 className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="font-display text-xl">{company.name}</DialogTitle>
              {company.industry && (
                <p className="text-sm text-muted-foreground">{company.industry}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {company.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {company.location}
            </div>
          )}

          {company.description && (
            <p className="text-sm text-muted-foreground">{company.description}</p>
          )}

          <Button
            onClick={() => {
              onClose();
              navigate(`/companies/${company.id}`);
            }}
            variant="hero"
            className="w-full"
          >
            View Full Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
