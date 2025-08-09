import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AIChat from "@/components/AIChat";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <AIChat />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
