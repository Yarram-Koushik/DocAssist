import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  MessageSquare, 
  FileText, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  HeartPulse, 
  Lock, 
  ArrowRight,
  Stethoscope,
  Activity,
  Pill,
  Award
} from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { 
      icon: MessageSquare, 
      title: "AI Medical Consultation", 
      desc: "Ask symptom and clinical questions with evidence-based reasoning, safety guardrails, and voice dictation.",
      badge: "Clinical NLP"
    },
    { 
      icon: FileText, 
      title: "Smart Lab Report Extractor", 
      desc: "Extracts 20+ blood biomarkers (Hemoglobin, WBC, Platelets, Fasting Glucose, Lipid profiles) with reference ranges.",
      badge: "PDF / Image OCR"
    },
    { 
      icon: Pill, 
      title: "Drug-Drug Interaction Checker", 
      desc: "Real-time pharmacological conflict detection and OpenFDA monograph lookups across multi-drug regimens.",
      badge: "OpenFDA Data"
    },
    { 
      icon: HeartPulse, 
      title: "Emergency Red-Flag Triage", 
      desc: "Instantly flags critical life-threatening symptoms (chest pain, stroke signs) with immediate emergency guidance.",
      badge: "Safety First"
    }
  ];

  const trustMetrics = [
    { value: "20+", label: "Blood Biomarkers Analyzed" },
    { value: "100%", label: "OpenFDA Monograph Accuracy" },
    { value: "256-bit", label: "Encrypted Health Records" },
    { value: "< 1s", label: "Instant Clinical Response" }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col selection:bg-primary/20">
      {/* Top Navigation */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-sm">
            <HeartPulse className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">DocAssist</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="font-semibold text-xs">
            Sign In
          </Button>
          <Button size="sm" onClick={() => navigate('/register')} className="font-bold text-xs gap-1.5 shadow-sm">
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6 text-center max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 animate-in fade-in duration-500">
            <Sparkles className="h-3.5 w-3.5" /> Advanced Clinical AI & Patient Health Companion
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
            Intelligent Health Insights <br />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Simplified for Everyone.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Understand lab reports, check multi-drug interactions, analyze symptoms, and export structured clinical consultation summaries for your doctor.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button size="lg" onClick={() => navigate('/register')} className="font-bold px-8 h-12 shadow-md gap-2">
              <HeartPulse className="h-5 w-5" /> Start Free Health Check
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="h-12 px-6 font-semibold">
              Explore Demo Account
            </Button>
          </div>

          {/* Metrics bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto border-t border-gray-200 dark:border-gray-800">
            {trustMetrics.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                <p className="text-2xl font-black text-primary">{m.value}</p>
                <p className="text-xs font-medium text-gray-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Cards Showcase */}
        <section className="py-20 bg-gray-50/60 dark:bg-gray-900/40 px-6 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Core Architecture</h2>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Engineered for Clinical Precision
              </h3>
              <p className="text-sm text-gray-500">
                Combining OpenFDA databases, regex biomarker parsers, and safe conversational AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <f.icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {f.badge}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">{f.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Safety Banner */}
        <section className="py-16 px-6 max-w-4xl mx-auto text-center space-y-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-2 text-xs font-bold">
            <ShieldCheck className="h-5 w-5" /> HIPAA-Inspired Security & Privacy Architecture
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Your Health Data Stays Safe & Confidential
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            All passwords are protected with 12-round bcrypt hashing, rate limiting, and automated account lockouts. Export or purge your consultation records anytime with one click.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 p-8 text-center bg-white dark:bg-gray-900 space-y-4">
        <Disclaimer className="max-w-3xl mx-auto" compact />
        <p className="text-xs text-gray-400">© 2026 DocAssist AI Clinical Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

