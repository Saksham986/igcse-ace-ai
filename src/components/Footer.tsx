import { BookOpen, Mail, Twitter, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-card border-t">
      <div className="container py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">IGCSEwise</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your AI-powered IGCSE companion. Master every subject with personalized 
              learning, instant feedback, and comprehensive resources.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Past Papers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Marking Schemes</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Study Guides</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Examiner Reports</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Topic Summaries</a></li>
            </ul>
          </div>

          {/* Subjects */}
          <div className="space-y-4">
            <h3 className="font-semibold">Subjects</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Mathematics</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Physics</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Chemistry</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Biology</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">English</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Student Guide</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 IGCSEwise. All rights reserved. Empowering IGCSE students worldwide.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Made with AI for education</span>
            <div className="h-4 w-px bg-border"></div>
            <span>99.9% Uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;