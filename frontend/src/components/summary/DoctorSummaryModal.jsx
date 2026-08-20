import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { 
  FileText, 
  Download, 
  Share2, 
  Check, 
  Copy, 
  X, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { post, get } from '../../lib/api';
import { API_URL } from '../../lib/constants';
import { toast } from 'react-hot-toast';

export const DoctorSummaryModal = ({ isOpen, onClose, conversationId, reports = [] }) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!conversationId) {
      toast.error('No active conversation to summarize.');
      return;
    }

    setLoading(true);
    try {
      const res = await post('/summary/generate', {
        conversation_id: conversationId,
        report_ids: selectedReportIds
      });

      if (res.data && res.data.success) {
        setSummaryData(res.data.data);
        toast.success('Clinical summary generated successfully!');
      } else {
        throw new Error(res.data?.message || 'Failed to generate summary');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Error generating summary');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!summaryData?.id) return;
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/summary/${summaryData.id}/export?format=pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('PDF export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DocAssist_Doctor_Summary_${summaryData.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF report downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download PDF summary');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTXT = async () => {
    if (!summaryData?.id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/summary/${summaryData.id}/export?format=txt`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DocAssist_Doctor_Summary_${summaryData.id}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Text summary downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download summary');
    }
  };

  const handleShare = async () => {
    if (!summaryData?.id) return;
    try {
      const res = await post(`/summary/${summaryData.id}/share`);
      if (res.data?.success && res.data?.data?.share_token) {
        const shareUrl = `${window.location.origin}/summary/share/${res.data.data.share_token}`;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Secure share link copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate share link');
    }
  };

  const parsedContent = summaryData?.content || (
    typeof summaryData?.summary_text === 'string'
      ? (summaryData.summary_text.startsWith('{') ? JSON.parse(summaryData.summary_text) : { patient_concern: summaryData.summary_text })
      : (summaryData?.summary_text || {})
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card-dark rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                Doctor Visit Clinical Summary
              </h3>
              <p className="text-xs text-gray-500">
                Transform consultation & reports into a clinical briefing for your doctor
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {!summaryData ? (
            <div className="space-y-6 text-center py-4">
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Generate Doctor Summary Note
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  DocAssist will synthesize symptoms, timelines, and lab parameters discussed in this conversation into an organized medical brief.
                </p>
              </div>

              {reports && reports.length > 0 && (
                <div className="text-left bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                    Attach Lab Reports to Summary (Optional):
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {reports.map(r => (
                      <label key={r.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedReportIds.includes(r.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReportIds([...selectedReportIds, r.id]);
                            } else {
                              setSelectedReportIds(selectedReportIds.filter(id => id !== r.id));
                            }
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span className="truncate">{r.filename} ({r.report_type})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  onClick={handleGenerate} 
                  disabled={loading}
                  size="lg"
                  className="gap-2 min-w-[200px] font-semibold"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Synthesizing Clinical Brief...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Briefing Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Primary Concern */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                  1. Chief Complaint & Primary Concern
                </span>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {parsedContent?.patient_concern || 'Not specified'}
                </p>
              </div>

              {/* Symptoms & Duration Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Symptoms Reported
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
                    <Clock className="h-3.5 w-3.5 text-blue-500" /> Reported Duration
                  </span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {parsedContent?.duration || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Lab Findings */}
              {Array.isArray(parsedContent?.report_findings) && parsedContent.report_findings.length > 0 && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                    <FileCheck className="h-3.5 w-3.5 text-green-500" /> Key Lab Findings
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

              {/* Questions for Doctor */}
              {Array.isArray(parsedContent?.questions_for_doctor) && parsedContent.questions_for_doctor.length > 0 && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                    <HelpCircle className="h-3.5 w-3.5" /> Suggested Questions for Your Doctor
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
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        {summaryData && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-card-dark flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Link Copied!' : 'Share Online Link'}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTXT}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> Text (.txt)
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadPDF}
                disabled={exporting}
                className="gap-1.5 text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5" />
                {exporting ? 'Generating PDF...' : 'Download Official PDF'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
