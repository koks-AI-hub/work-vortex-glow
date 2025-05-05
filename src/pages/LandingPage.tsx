
import { Link } from "react-router-dom";
import { Briefcase, User } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-vortex-600 to-vortex-400 flex items-center justify-center mr-2">
            <span className="text-white font-bold">W</span>
          </div>
          <span className="text-xl font-bold text-white">Work Vortex</span>
        </div>
        <div className="space-x-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 md:p-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Find Your <span className="text-gradient">Perfect Match</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto">
            Connect employers with top talent and help job seekers find their dream roles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <GlassCard className="flex flex-col items-center p-8 animate-scale-up" hoverEffect>
            <User className="h-16 w-16 mb-4 text-vortex-400" />
            <h2 className="text-2xl font-bold text-white mb-2">For Job Seekers</h2>
            <p className="text-gray-300 text-center mb-6">
              Discover opportunities and advance your career with personalized job matches
            </p>
            <Button size="lg" asChild>
              <Link to="/register?role=employee">Continue as Employee</Link>
            </Button>
          </GlassCard>

          <GlassCard className="flex flex-col items-center p-8 animate-scale-up" hoverEffect>
            <Briefcase className="h-16 w-16 mb-4 text-vortex-400" />
            <h2 className="text-2xl font-bold text-white mb-2">For Employers</h2>
            <p className="text-gray-300 text-center mb-6">
              Find qualified candidates and streamline your hiring process
            </p>
            <Button size="lg" asChild>
              <Link to="/register?role=company">Continue as Company</Link>
            </Button>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-gray-400 text-sm">
        <p>© 2025 Work Vortex. All rights reserved.</p>
      </footer>
    </div>
  );
}
