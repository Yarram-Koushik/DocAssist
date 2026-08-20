import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ValueCard } from '../components/reports/ValueCard';
import { 
  UploadCloud, 
  File, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  RotateCcw, 
  Clock, 
  Info,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { REPORT_TYPES, API_URL } from '../lib/constants';

export const UploadReportPage = () => {
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState('CBC');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 
      'application/pdf': ['.pdf'], 
      'image/*': ['.jpeg', '.jpg', '.png'] 
    },
    maxFiles: 1,
    onDrop: accepted => {
      if (accepted && accepted.length > 0) {
        setFile(accepted[0]);
      }
    }
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('report_type', reportType);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reports/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });


      const resData = await response.json();
      
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to analyze report');
      }

      const data = resData.data;
      const rawFindings = data.extracted_values || data.extracted_data || [];
      const findings = typeof rawFindings === 'string' ? JSON.parse(rawFindings) : (Array.isArray(rawFindings) ? rawFindings : []);

      const formattedFindings = (findings || []).map(f => {
        let rangeText = '';
        if (typeof f.reference_range === 'object' && f.reference_range !== null) {
          rangeText = `${f.reference_range.min ?? ''} - ${f.reference_range.max ?? ''} ${f.reference_range.unit ?? ''}`.trim();
        } else if (f.reference_range) {
          rangeText = String(f.reference_range);
        } else if (f.range) {
          rangeText = String(f.range);
        }
        return {
          name: f.name || f.parameter || 'Unknown Parameter',
          value: f.value,
          unit: f.unit || '',
          status: f.status || 'normal',
          range: rangeText || 'N/A'
        };
      });

      const abnormalCount = formattedFindings.filter(f => 
        f.status === 'low' || f.status === 'high' || f.status === 'below' || f.status === 'above'
      ).length;

      setResult({
        id: data.id,
        filename: data.filename || file.name,
        type: data.report_type || reportType || 'Medical Report',
        uploadedAt: data.uploaded_at || new Date().toISOString(),
        findings: formattedFindings,
        abnormalCount,
        summary: data.ai_explanation
      });

      toast.success('Report analyzed successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error uploading and analyzing report');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Medical Report</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload blood work, lab panels, or scans for automated value extraction & AI explanation.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/history')}
          className="self-start sm:self-auto gap-1.5"
        >
          <Clock className="h-4 w-4" /> Past Reports
        </Button>
      </div>
      
      {!result ? (
        <div className="space-y-6">
          {/* Report Type Selector */}
          <Card>
            <CardContent className="p-6">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Select Report Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(REPORT_TYPES || ['CBC', 'Thyroid', 'Blood Sugar', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Other']).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setReportType(type)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      reportType === type
                        ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload Dropzone Card */}
          <Card>
            <CardContent className="p-8 space-y-6">
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  isDragActive 
                    ? 'border-primary bg-primary/10 scale-[0.99]' 
                    : file 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-card-dark/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="h-8 w-8" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-primary font-semibold text-base">
                      <File className="h-5 w-5" /> {file.name}
                    </div>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • Click or drag to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                      Drag & drop your lab report here, or <span className="text-primary underline">browse</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Supports PDF documents, JPG, PNG image files (up to 10MB)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span>Your medical data is encrypted and parsed securely.</span>
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || uploading} 
                  size="lg"
                  className="gap-2 font-semibold min-w-[160px]"
                >
                  {uploading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Overview Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      {result.type}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {result.filename}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500">
                    Analyzed on {new Date(result.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium">
                    <span className="text-gray-500">Parameters:</span> <strong className="text-gray-900 dark:text-gray-100">{result.findings.length}</strong>
                  </div>
                  {result.abnormalCount > 0 ? (
                    <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {result.abnormalCount} Out of Range
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      All In Range
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Summary Section */}
              <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-semibold text-sm">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  DocAssist AI Clinical Summary
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {result.summary}
                </div>
              </div>

              {/* Detailed Findings Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Detailed Lab Findings ({result.findings.length})
                  </h3>
                </div>

                {result.findings.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-sm text-gray-500">
                      No standardized tabular parameters could be extracted automatically, but the text was analyzed in the AI Summary above.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {result.findings.map((finding, idx) => (
                      <ValueCard
                        key={idx}
                        name={finding.name}
                        value={finding.value}
                        unit={finding.unit}
                        status={finding.status}
                        range={finding.range}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button 
                  onClick={() => { setResult(null); setFile(null); }} 
                  variant="outline" 
                  className="gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" /> Upload Another Report
                </Button>

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => navigate('/chat')} 
                    className="gap-1.5 font-semibold"
                  >
                    <MessageSquare className="h-4 w-4" /> Ask DocAssist AI in Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

