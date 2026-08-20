import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  MessageSquare, 
  FileText, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Activity, 
  Clock, 
  Stethoscope, 
  AlertTriangle, 
  HeartPulse, 
  Thermometer, 
  ShieldCheck, 
  ArrowRight,
  Pill,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Disclaimer } from '../components/common/Disclaimer';
import { get, post } from '../lib/api';
import { toast } from 'react-hot-toast';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({ chats: 0, reports: 0, medicines: 0, alerts: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [recentChats, setRecentChats] = useState([]);

  // Rapid Symptom Triage Widget State
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [severityLevel, setSeverityLevel] = useState(3);
  const [duration, setDuration] = useState('1-3 days');
  const [triageStarting, setTriageStarting] = useState(false);

  const COMMON_SYMPTOMS = [
    { id: 'fever', label: 'Fever & Chills', icon: Thermometer, urgent: false },
    { id: 'cough', label: 'Persistent Cough', icon: Activity, urgent: false },
    { id: 'chest', label: 'Chest Pressure / Tightness', icon: HeartPulse, urgent: true },
    { id: 'headache', label: 'Severe Headache', icon: Stethoscope, urgent: false },
    { id: 'digestive', label: 'Stomach / Abdominal Pain', icon: Activity, urgent: false },
    { id: 'skin', label: 'Skin Rash or Swelling', icon: ShieldAlert, urgent: false }
  ];

  useEffect(() => {
    get('/analytics/user').then(res => {
      const data = res.data.data || {};
      setUserStats({
        chats: data.total_conversations || 0,
        reports: data.total_reports || 0,
        medicines: data.total_medicine_searches || 0,
        alerts: data.total_alerts || 0
      });
    }).catch(() => {});

    get('/reports/').then(res => {
      const list = res.data.data.items || res.data.data || [];
      setRecentReports(list.slice(0, 3));
    }).catch(() => {});

    get('/chat/conversations').then(res => {
      const list = res.data.data.items || res.data.data || [];
      setRecentChats(list.slice(0, 3));
    }).catch(() => {});
  }, []);

  const handleStartTriageChat = async () => {
    if (!selectedSymptom) {
      toast.error('Please select a symptom to evaluate');
      return;
    }

    setTriageStarting(true);
    try {
      const symObj = COMMON_SYMPTOMS.find(s => s.id === selectedSymptom);
      const prompt = `I am experiencing ${symObj?.label}. Severity is rated ${severityLevel}/10, duration is ${duration}. Please provide a clinical triage assessment, what to look out for, and when to seek urgent medical attention.`;
      
      const newConvRes = await post('/chat/conversations', { title: `${symObj?.label} Triage` });
      const convId = newConvRes.data.data.id;
      
      await post(`/chat/conversations/${convId}/messages`, { message: prompt });
      navigate(`/chat/${convId}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start triage conversation');
    } finally {
      setTriageStarting(false);
    }
  };

  const stats = [
    { label: 'Consultation Chats', value: userStats.chats, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Analyzed Reports', value: userStats.reports, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Medicine Lookups', value: userStats.medicines, icon: Search, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Health Alerts', value: userStats.alerts, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  ];

  const quickActions = [
    { title: 'AI Health Consultation', desc: 'Ask about symptoms, conditions, and care', path: '/chat', icon: MessageSquare, color: 'text-blue-600' },
    { title: 'Upload & Parse Lab Report', desc: 'Instant parameter extraction & AI analysis', path: '/upload-report', icon: FileText, color: 'text-emerald-600' },
    { title: 'Search FDA Drug Guide', desc: 'Check uses, side effects & warnings', path: '/medicine-search', icon: Pill, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full pb-10">
      {/* Welcome Hero Banner */}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-blue-700 p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs text-white">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen AI Health Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || user?.username || 'Patient'}
          </h1>
          <p className="text-sm text-blue-100 leading-relaxed">
            Your personalized clinical companion for lab report insights, medication reference, and clinical triage support.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button 
              onClick={() => navigate('/chat')}
              className="bg-white text-primary hover:bg-blue-50 font-bold text-xs px-5 h-10 gap-1.5 shadow-sm"
            >
              <MessageSquare className="h-4 w-4" /> Start Consultation
            </Button>
            <Button 
              onClick={() => navigate('/upload-report')}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 font-semibold text-xs px-5 h-10 gap-1.5"
            >
              <FileText className="h-4 w-4" /> Analyze Medical Report
            </Button>
          </div>
        </div>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-gray-200 dark:border-gray-800 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">{s.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Rapid Symptom Triage Widget */}
      <Card className="border-primary/30 shadow-md overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary text-white">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Interactive Rapid Symptom Triage
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Select your primary symptom to assess severity and get immediate guidance
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10">
              Live AI Assessment
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Step 1: Select Symptom */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              1. What is your primary symptom?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COMMON_SYMPTOMS.map((s) => {
                const isSelected = selectedSymptom === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSymptom(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected 
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <s.icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                    <span className="text-xs leading-tight">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Severity & Duration Grid */}
          <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  2. Discomfort / Pain Level: <span className="text-primary font-extrabold">{severityLevel}/10</span>
                </label>
                <span className="text-[11px] text-gray-500">
                  {severityLevel <= 3 ? 'Mild' : severityLevel <= 7 ? 'Moderate' : 'Severe'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={severityLevel}
                onChange={(e) => setSeverityLevel(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>1 (Barely noticeable)</span>
                <span>5 (Distracting)</span>
                <span>10 (Unbearable)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                3. How long have you had this?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['< 24 Hours', '1-3 Days', '> 1 Week'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                      duration === d 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Triage Trigger Button */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] text-gray-500 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Automated AI Clinical Triage Protocol
            </p>
            <Button
              onClick={handleStartTriageChat}
              disabled={!selectedSymptom || triageStarting}
              size="sm"
              className="gap-2 font-semibold text-xs px-5"
            >
              {triageStarting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting Evaluation...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Start Triage Evaluation <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Physiological Vitals Quick-Logger */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <div>
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Daily Physiological Vitals Tracker
              </CardTitle>
              <p className="text-xs text-gray-500">Record and monitor your daily cardiovascular and metabolic metrics</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Clinical Baselines
          </span>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Blood Pressure */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 block">Blood Pressure</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-gray-900 dark:text-gray-100">120/80</span>
                <span className="text-[10px] text-gray-400">mmHg</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block pt-0.5">
                ● Optimal Reading
              </span>
            </div>

            {/* Heart Rate */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 block">Resting Heart Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-gray-900 dark:text-gray-100">72</span>
                <span className="text-[10px] text-gray-400">BPM</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block pt-0.5">
                ● Normal Sinus Rhythm
              </span>
            </div>

            {/* Blood Glucose */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 block">Fasting Glucose</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-gray-900 dark:text-gray-100">94</span>
                <span className="text-[10px] text-gray-400">mg/dL</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block pt-0.5">
                ● Normal Fasting
              </span>
            </div>

            {/* Oxygen Saturation */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 block">Oxygen Saturation</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-gray-900 dark:text-gray-100">99%</span>
                <span className="text-[10px] text-gray-400">SpO2</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block pt-0.5">
                ● Normal Oxygenation
              </span>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Quick Access Actions */}
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">Core Capabilities</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Card 
              key={i} 
              className="hover:border-primary/50 hover:shadow-md cursor-pointer transition-all group" 
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-105 transition-transform">
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Health Activity Summary */}
      {(recentReports.length > 0 || recentChats.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Recent Reports */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Recent Lab Reports
              </CardTitle>
              <button onClick={() => navigate('/history')} className="text-xs font-medium text-primary hover:underline">
                View All
              </button>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
              {recentReports.length === 0 ? (
                <div className="p-4 text-xs text-gray-400">No reports uploaded yet.</div>
              ) : (
                recentReports.map(r => (
                  <div 
                    key={r.id}
                    onClick={() => navigate('/history')} 
                    className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200">{r.filename}</h4>
                      <p className="text-[11px] text-gray-400">{r.report_type || 'General Report'}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(r.uploaded_at || r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Consultations */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-blue-500" /> Recent Consultations
              </CardTitle>
              <button onClick={() => navigate('/history')} className="text-xs font-medium text-primary hover:underline">
                View All
              </button>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
              {recentChats.length === 0 ? (
                <div className="p-4 text-xs text-gray-400">No consultations yet.</div>
              ) : (
                recentChats.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => navigate(`/chat/${c.id}`)} 
                    className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{c.title || 'Consultation'}</h4>
                      <p className="text-[11px] text-gray-400">AI Medical Assistant</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Disclaimer />
    </div>
  );
};

