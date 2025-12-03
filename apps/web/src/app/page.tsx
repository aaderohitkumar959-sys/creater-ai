import Link from "next/link";
import { Sparkles, DollarSign, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              CreatorAI
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/become-creator">
              <Button>Become a Creator</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Build & Monetize
          <br />
          AI Characters
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create Instagram-style AI personalities, chat with them in real-time,
          and earn money from every conversation.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="/admin">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Admin Panel
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Succeed
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Sparkles className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>AI Character Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Build unique AI personas with custom personalities, training data,
                and conversation styles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Real-Time Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Engage users with instant AI responses powered by advanced language
                models via WebSocket.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Earn Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get paid 70% of every message. Users pay 2 coins per message,
                you earn 1.4 coins each.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white my-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">1,234+</div>
            <div className="text-blue-100">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">89</div>
            <div className="text-blue-100">Creators</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">$45K+</div>
            <div className="text-blue-100">Total Earnings</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Start Earning?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of creators monetizing their AI characters today.
        </p>
        <Link href="/become-creator">
          <Button size="lg" className="text-lg px-12">
            Create Your First AI Character
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2024 CreatorAI. Built with Next.js, NestJS, and AI.</p>
        </div>
      </footer>
    </div>
  );
}

