import { BookOpen, Mail, Twitter, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">© 2025 Studybuddy AI. All rights reserved.</div>
        <div className="text-xs text-muted-foreground">Built for IGCSE students • Privacy-first</div>
      </div>
    </footer>
  );
};

export default Footer;