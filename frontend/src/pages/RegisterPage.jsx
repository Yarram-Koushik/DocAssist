import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  HeartPulse, 
  ShieldCheck, 
  FileText, 
  Pill, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  User, 
  Mail, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters long and contain at least one number.");
    }
    setIsLoading(true);
    try {
      await register({ full_name: formData.name, username: formData.username, email: formData.email, password: formData.password });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 overflow-hidden">
      {/* Dynamic Medical Wallpaper Backdrop */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-60">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-6 text-white">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="h-3.5 w-3.5" /> Next-Gen Patient Healthcare Platform
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Clinical intelligence, <br />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                simplified for you.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Create your secure DocAssist account to analyze blood test reports, verify drug interactions, and export doctor consultation summaries.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              { icon: FileText, title: 'Smart Lab Parameter Extraction', desc: 'Instant regex OCR analysis for 20+ blood biomarkers' },
              { icon: Pill, title: 'Drug-Drug Interaction Checker', desc: 'Real-time openFDA monographs and synergistic safety warnings' },
              { icon: ShieldCheck, title: 'HIPAA-Inspired 256-Bit Protection', desc: 'Protected with bcrypt-12 hashing and strict rate limiting' }
            ].map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xs">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                  <feat.icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{feat.title}</h4>
                  <p className="text-[11px] text-slate-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Evidence-Based</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>OpenFDA Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Doctor Summary PDF</span>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form Card */}
        <div className="lg:col-span-6 w-full">
          <Card className="w-full bg-slate-900/90 border border-slate-800 text-slate-100 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-4 pt-6 border-b border-slate-800/80 bg-slate-900/50">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-extrabold text-white">DocAssist</CardTitle>
              </div>
              <p className="text-xs text-slate-400">Create your patient consultation account</p>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3.5 p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Full Name</label>
                    <Input 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. John Doe"
                      className="h-9 text-xs bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Username</label>
                    <Input 
                      required 
                      value={formData.username} 
                      onChange={e => setFormData({...formData, username: e.target.value})} 
                      placeholder="e.g. johndoe12"
                      className="h-9 text-xs bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                  <Input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    placeholder="john@example.com"
                    className="h-9 text-xs bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Password</label>
                    <Input 
                      type="password" 
                      required 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      placeholder="••••••••"
                      className="h-9 text-xs bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Confirm Password</label>
                    <Input 
                      type="password" 
                      required 
                      value={formData.confirmPassword} 
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                      placeholder="••••••••"
                      className="h-9 text-xs bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  Password must be 8+ characters and contain at least one letter and one number.
                </p>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3 px-6 pb-6 pt-0">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-10 font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                <div className="text-xs text-center text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-400 font-semibold hover:underline">
                    Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

