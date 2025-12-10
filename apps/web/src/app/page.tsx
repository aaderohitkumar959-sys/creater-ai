import Link from "next/link";
import { Sparkles, MessageSquare, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeaturedCharacters from "@/components/home/FeaturedCharacters";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-xl bg-glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary animate-float" />
            <span className="text-2xl font-bold text-gradient">
              CreatorAI
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/explore">
              <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
                Explore
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-border-light">Login</Button>
            </Link>
            <Link href="/become-creator">
              <Button className="btn-primary glow">Become a Creator</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse animation-delay-200" />
        </div>

        <div className="container mx-auto px-4 py-32 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-display-lg mb-6">
              Chat with{" "}
              <span className="text-gradient">AI Personalities</span>
            </h1>
            <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
              From anime girlfriends to wise mentors. Meet unique AI characters that feel alive.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/explore">
                <Button size="lg" className="btn-primary glow text-lg px-8 h-14">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Chatting Free
                </Button>
              </Link>
              <Link href="/become-creator">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-border-light hover:border-primary">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Your AI
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-slide-up animation-delay-200">
            <div className="glass-card p-6">
              <div className="text-4xl font-bold text-gradient mb-2">20+</div>
              <div className="text-text-muted text-sm">AI Personalities</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-4xl font-bold text-gradient mb-2">1k+</div>
              <div className="text-text-muted text-sm">Conversations</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-4xl font-bold text-gradient mb-2">4.9★</div>
              <div className="text-text-muted text-sm">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Personas */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-display-sm mb-4 text-text-primary">
            Popular AI Characters
          </h2>
          <p className="text-text-secondary">
            Start chatting with our most loved personalities
          </p>
        </div>
        <FeaturedCharacters />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="persona-card p-8 text-center animate-scale-in">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow-md">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-text-primary">Real-time Chat</h3>
            <p className="text-text-secondary">
              Instant responses with personality. Every character feels unique and alive.
            </p>
          </div>

          <div className="persona-card p-8 text-center animate-scale-in animation-delay-100">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent-purple rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow-purple">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-text-primary">Emotional Intelligence</h3>
            <p className="text-text-secondary">
              AI that remembers you, understands context, and adapts to your mood.
            </p>
          </div>

          <div className="persona-card p-8 text-center animate-scale-in animation-delay-200">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow-md">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-text-primary">Always Free</h3>
            <p className="text-text-secondary">
              40 messages per day free. Premium for unlimited chats and exclusive characters.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          <div className="relative z-10">
            <h2 className="text-display-sm mb-4 text-text-primary">
              Ready to meet your new AI friend?
            </h2>
            <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands chatting with unique AI personalities. It's free to start!
            </p>
            <Link href="/explore">
              <Button size="lg" className="btn-primary glow text-lg px-10 h-14">
                <MessageSquare className="mr-2 h-5 w-5" />
                Explore All Personas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold text-gradient">CreatorAI</span>
              </div>
              <p className="text-text-muted text-sm">
                The next generation of AI character chat.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-text-primary">Product</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><Link href="/explore" className="hover:text-primary">Explore</Link></li>
                <li><Link href="/store" className="hover:text-primary">Personas Store</Link></li>
                <li><Link href="/become-creator" className="hover:text-primary">Become Creator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-text-primary">Company</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-text-primary">Legal</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
                <li><a href="#" className="hover:text-primary">Guidelines</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-text-muted text-sm">
            <p>© 2025 CreatorAI. Built with ❤️ for amazing conversations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
