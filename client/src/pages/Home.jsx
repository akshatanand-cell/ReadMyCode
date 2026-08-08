import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  FileText,
  GitBranch,
  Network,
  FunctionSquare,
  Bug,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Star,
  Github,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';

const features = [
  {
    icon: FileText,
    title: 'README Generation',
    description: 'Automatically generate comprehensive README files with project overview, installation guides, and usage examples.',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Code2,
    title: 'API Documentation',
    description: 'Extract and document all API endpoints, request/response schemas, and authentication requirements.',
    color: 'from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-400',
  },
  {
    icon: GitBranch,
    title: 'Flowcharts',
    description: 'Visualize code flow and logic with interactive Mermaid.js diagrams generated from your source code.',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Network,
    title: 'Architecture Diagrams',
    description: 'Map out your system architecture with React Flow interactive node-based diagrams.',
    color: 'from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-400',
  },
  {
    icon: FunctionSquare,
    title: 'Function Explanations',
    description: 'Get detailed explanations for every function with parameters, return types, and usage examples.',
    color: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-400',
  },
  {
    icon: Bug,
    title: 'Interactive Debugger',
    description: 'Paste errors and get AI-powered debugging suggestions with fix recommendations.',
    color: 'from-rose-500/20 to-rose-600/10',
    iconColor: 'text-rose-400',
  },
];

const stats = [
  { value: '10K+', label: 'Repositories Analyzed' },
  { value: '50K+', label: 'Functions Documented' },
  { value: '99.9%', label: 'Analysis Accuracy' },
  { value: '< 2min', label: 'Avg. Processing Time' },
];

const steps = [
  {
    number: '01',
    title: 'Upload Repository',
    description: 'Paste a GitHub URL or upload a ZIP file containing your codebase.',
  },
  {
    number: '02',
    title: 'AI Analysis',
    description: 'Our engine parses your code using AST analysis and advanced AI models.',
  },
  {
    number: '03',
    title: 'Get Insights',
    description: 'Receive comprehensive documentation, diagrams, and explanations instantly.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Developer',
    company: 'TechCorp',
    content: 'ReadMyCode saved us weeks of documentation work. The architecture diagrams alone are worth it.',
  },
  {
    name: 'James Wilson',
    role: 'Tech Lead',
    company: 'StartupXYZ',
    content: 'The function explanations helped our new team members onboard 3x faster. Incredible tool.',
  },
  {
    name: 'Maria Garcia',
    role: 'Open Source Maintainer',
    company: 'GitHub',
    content: 'I use this for every new repository. The README generation is spot-on every time.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-background min-h-screen text-text-primary">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Powered by Advanced AI</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-text-primary">Understand Your</span>
              <br />
              <span className="text-gradient">Code in Seconds</span>
            </h1>

            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload any repository and get instant README generation, API documentation,
              architecture diagrams, flowcharts, and AI-powered debugging.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                size="lg"
                onClick={() => navigate(isAuthenticated ? '/analyze' : '/register')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {isAuthenticated ? 'Start Analyzing' : 'Get Started Free'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                leftIcon={<Github className="w-5 h-5" />}
              >
                View Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-border/50">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-card/40 border border-border/40">
                  <div className="text-3xl font-extrabold text-gradient mb-1">{stat.value}</div>
                  <div className="text-xs text-text-secondary font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background-secondary/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Everything You Need to Document Your Code
            </h2>
            <p className="text-text-secondary text-lg">
              Automated AI documentation suite built for modern software engineers, tech leads, and open-source contributors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-xl"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-6`}>
                    <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{feat.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{feat.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">How ReadMyCode Works</h2>
            <p className="text-text-secondary text-lg">3 simple steps to transform raw code into interactive documentation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative p-8 rounded-2xl bg-card/60 border border-border">
                <div className="text-4xl font-black text-primary/40 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Loved by Engineers</h2>
            <p className="text-text-secondary text-lg">Here is what developers are saying about ReadMyCode.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between">
                <p className="text-text-secondary text-sm italic mb-6">"{item.content}"</p>
                <div>
                  <div className="font-bold text-text-primary">{item.name}</div>
                  <div className="text-xs text-text-muted">{item.role} · {item.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border border-primary/30 backdrop-blur-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Ready to Document Your Project?</h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-8">
              Join thousands of developers using AI to simplify code comprehension and onboarding.
            </p>
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/analyze' : '/register')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;