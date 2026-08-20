import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  HeartPulse, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Pill, 
  CheckCircle2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
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

      <div className="relative z-10 w-full max-w-4xl grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Info Column */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 text-white pr-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="h-3.5 w-3.5" /> Welcome Back to DocAssist
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Sign in to your <br />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Clinical Health Portal
              </span>
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access your medical consultations, reviewed lab reports, personalized vitals history, and physician notes.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: FileText, text: 'Instant access to blood test analysis' },
              { icon: Pill, text: 'Comprehensive medication interaction safety' },
              { icon: ShieldCheck, text: 'Enterprise-grade rate-limiting & 12-round bcrypt' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <item.icon className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="text-slate-200">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-6 w-full">
          <Card className="w-full bg-slate-900/90 border border-slate-800 text-slate-100 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-4 pt-6 border-b border-slate-800/80 bg-slate-900/50">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-extrabold text-white">DocAssist</CardTitle>
              </div>
              <p className="text-xs text-slate-400">Sign in to your patient account</p>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <Input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="john@example.com"
                    className="h-10 text-xs bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <Input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="h-10 text-xs bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 px-6 pb-6 pt-0">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-10 font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                <div className="text-xs text-center text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-400 font-semibold hover:underline">
                    Register for Free
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

