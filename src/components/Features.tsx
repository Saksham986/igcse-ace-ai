import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Brain, 
  BarChart3, 
  Search,
  Clock,
  Target,
  Lightbulb,
  Award,
  Users,
  Zap
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Complete Resource Hub",
      description: "Access thousands of past papers, marking schemes, examiner reports, and study guides for all IGCSE subjects.",
      badge: "Resources"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "AI Chat Tutor",
      description: "Get instant explanations for any topic with our syllabus-trained AI that adapts to your learning level.",
      badge: "AI-Powered"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Intelligent Marking",
      description: "Submit essays and answers for instant grading with detailed feedback using official marking criteria.",
      badge: "Assessment"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Personalized Learning",
      description: "AI tracks your progress and creates customized study plans based on your strengths and weaknesses.",
      badge: "Smart"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Progress Analytics",
      description: "Visual dashboards showing improvement trends, topic mastery, and exam readiness scores.",
      badge: "Analytics"
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Smart Search",
      description: "Find any resource in seconds with natural language search. Ask for specific papers or topics.",
      badge: "Search"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 Availability",
      description: "Your AI tutor never sleeps. Get help anytime, whether it's late night study sessions or early morning prep.",
      badge: "Always On"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Exam Preparation",
      description: "Targeted practice questions and mock exams with instant AI grading to simulate real exam conditions.",
      badge: "Practice"
    }
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform combines AI intelligence with extensive IGCSE resources 
            to provide the ultimate study experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 bg-card rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-semibold">50,000+</div>
                <div className="text-sm text-muted-foreground">Study Resources</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-semibold">10,000+</div>
                <div className="text-sm text-muted-foreground">Students Helped</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-semibold">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-semibold">&lt;2s</div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;