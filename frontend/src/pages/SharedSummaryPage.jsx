import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  FileText, 
  Download, 
  Stethoscope, 
  Calendar, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { get } from '../lib/api';
import { Disclaimer } from '../components/common/Disclaimer';

export const SharedSummaryPage = () => {
  const { token } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    get(`/summary/share/${token}`)
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setSummary(res.data.data);
        } else {
          setError('This clinical summary link is invalid or expired.');
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load shared clinical summary.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
          <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading Clinical Summary for Healthcare Provider...
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Summary Not Available</h2>
          <p className="text-xs text-gray-500">{error || 'Unable to retrieve clinical summary.'}</p>
        </Card>
      </div>
    );
  }

  const parsedContent = summary.content || (
    typeof summary.summary_text === 'string'
      ? (summary.summary_text.startsWith('{') ? JSON.parse(summary.summary_text) : { patient_concern: summary.summary_text })
      : (summary.summary_text || {})
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <Card className="border-primary/20 shadow-md overflow-hidden">
          <div className="bg-primary p-6 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
                  DocAssist • Clinical Consultation Briefing
                </span>
                <h1 className="text-xl sm:text-2xl font-black">
                  Patient Visit Summary Note
                </h1>
                <p className="text-xs text-blue-100 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Generated on {new Date(summary.created_at || Date.now()).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure Share Link
              </span>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Chief Concern */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                1. Chief Complaint & Primary Patient Concern
              </span>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {parsedContent?.patient_concern || 'Not specified'}
              </p>
            </div>

            {/* Symptoms & Duration Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Reported Symptoms
                </span>
                {Array.isArray(parsedContent?.symptoms) && parsedContent.symptoms.length > 0 ? (
                  <ul className="space-y-1">
                    {parsedContent.symptoms.map((s, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">{parsedContent?.symptoms || 'None specified'}</p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                  <Clock className="h-3.5 w-3.5 text-blue-500" /> Duration of Symptoms
                </span>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {parsedContent?.duration || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Lab Findings */}
            {Array.isArray(parsedContent?.report_findings) && parsedContent.report_findings.length > 0 && (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                  <FileCheck className="h-3.5 w-3.5 text-green-500" /> Associated Diagnostic & Lab Findings
                </span>
                <ul className="space-y-1">
                  {parsedContent.report_findings.map((f, i) => (
                    <li key={i} className="text-xs text-gray-700 dark:text-gray-300">
                      • {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions for Healthcare Provider */}
            {Array.isArray(parsedContent?.questions_for_doctor) && parsedContent.questions_for_doctor.length > 0 && (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-950/20">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                  <HelpCircle className="h-3.5 w-3.5" /> Patient Questions for Clinical Provider
                </span>
                <ul className="space-y-1.5">
                  {parsedContent.questions_for_doctor.map((q, i) => (
                    <li key={i} className="text-xs text-gray-800 dark:text-gray-200 font-medium flex items-start gap-2">
                      <span className="text-primary font-bold">{i + 1}.</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Disclaimer />
      </div>
    </div>
  );
};
