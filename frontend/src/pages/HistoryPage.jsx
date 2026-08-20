import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ValueCard } from '../components/reports/ValueCard';
import { get } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

export const HistoryPage = () => {
  const [chats, setChats] = useState([]);
  const [reports, setReports] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      get('/chat/conversations').then(res => setChats(res.data.data.items || res.data.data || [])),
      get('/reports/').then(res => setReports(res.data.data.items || res.data.data || [])),
      get('/medicine/history').then(res => setMedicines(res.data.data.items || res.data.data || []))
    ]).finally(() => setLoading(false));
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const parseReportFindings = (report) => {
    if (!report) return [];
    const raw = report.extracted_values || report.extracted_data || [];
    const list = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
    return list.map(f => {
      let rangeText = '';
      if (typeof f.reference_range === 'object' && f.reference_range !== null) {
        rangeText = `${f.reference_range.min ?? ''} - ${f.reference_range.max ?? ''} ${f.reference_range.unit ?? ''}`.trim();
      } else if (f.reference_range) {
        rangeText = String(f.reference_range);
      } else if (f.range) {
        rangeText = String(f.range);
      }
      return {
        name: f.name || f.parameter || 'Parameter',
        value: f.value,
        unit: f.unit || '',
        status: f.status || 'normal',
        range: rangeText || 'N/A'
      };
    });
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pb-10">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Medical History & Records</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View your past clinical conversations, analyzed reports, and medicine lookups.
        </p>
      </div>
      
      <Tabs defaultValue="reports">
        <TabsList className="mb-6 grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" /> Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="chats" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Chats ({chats.length})
          </TabsTrigger>
          <TabsTrigger value="medicines" className="gap-2">
            <Search className="h-4 w-4" /> Medicines ({medicines.length})
          </TabsTrigger>
        </TabsList>
        
        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center space-y-3">
                <FileText className="h-10 w-10 mx-auto text-gray-400 opacity-60" />
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">No medical reports analyzed yet.</p>
                <Button onClick={() => navigate('/upload-report')} size="sm">
                  Upload Your First Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map(r => {
                const isSelected = selectedReport?.id === r.id;
                const findings = isSelected ? parseReportFindings(r) : [];
                return (
                  <Card 
                    key={r.id} 
                    className={`transition-all ${isSelected ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'hover:border-gray-300 dark:hover:border-gray-700'}`}
                  >
                    <div 
                      onClick={() => setSelectedReport(isSelected ? null : r)}
                      className="p-5 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                              {r.filename}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {r.report_type || 'General'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Uploaded on {formatDate(r.uploaded_at || r.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          {isSelected ? 'Collapse' : 'View Analysis'}
                          {isSelected ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="px-5 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-5 animate-in fade-in duration-200">
                        {r.ai_explanation && (
                          <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200 mb-1.5">
                              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              AI Clinical Explanation
                            </div>
                            <p className="whitespace-pre-line">{r.ai_explanation}</p>
                          </div>
                        )}

                        {findings.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5" /> Extracted Parameters
                            </h5>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {findings.map((f, i) => (
                                <ValueCard
                                  key={i}
                                  name={f.name}
                                  value={f.value}
                                  unit={f.unit}
                                  status={f.status}
                                  range={f.range}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          <Button 
                            size="sm"
                            onClick={() => navigate('/chat')} 
                            className="gap-1.5"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Discuss with AI
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        {/* Chats Tab */}
        <TabsContent value="chats">
          <Card>
            <CardContent className="p-0 divide-y dark:divide-gray-800">
              {chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No chats yet.</div>
              ) : chats.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => navigate(`/chat/${c.id}`)} 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {c.title || 'New Conversation'}
                    </h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(c.updated_at || c.created_at)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Medicines Tab */}
        <TabsContent value="medicines">
          <Card>
            <CardContent className="p-0 divide-y dark:divide-gray-800">
              {medicines.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No medicine searches yet.</div>
              ) : medicines.map(m => (
                <div key={m.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{m.search_query}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Generic: <strong className="text-gray-700 dark:text-gray-300">{m.generic_name || 'N/A'}</strong> • {formatDate(m.searched_at || m.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

