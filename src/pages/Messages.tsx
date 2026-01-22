import { Layout } from "@/components/Layout";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">No Messages Yet</h1>
        <p className="text-muted-foreground">
          Messages will appear here when employers contact you about your applications.
        </p>
      </div>
    </Layout>
  );
}
