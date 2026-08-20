import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { 
  Search, 
  Pill, 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Clock, 
  BookOpen, 
  HelpCircle,
  Stethoscope,
  Plus,
  X,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Disclaimer } from '../components/common/Disclaimer';
import { post, get } from '../lib/api';
import { toast } from 'react-hot-toast';

export const MedicineSearchPage = () => {
  const [activeTab, setActiveTab] = useState('search');
  
  // Single Drug Search State
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Multi-Drug Interaction State
  const [interactionDrugs, setInteractionDrugs] = useState(['Warfarin', 'Aspirin']);
  const [currentDrugInput, setCurrentDrugInput] = useState('');
  const [interactionResult, setInteractionResult] = useState(null);
  const [interactionLoading, setInteractionLoading] = useState(false);

  const POPULAR_MEDICINES = [
    { name: 'Amoxicillin', type: 'Antibiotic' },
    { name: 'Ibuprofen', type: 'NSAID / Pain' },
    { name: 'Metformin', type: 'Antidiabetic' },
    { name: 'Lisinopril', type: 'Blood Pressure' },
    { name: 'Acetaminophen', type: 'Analgesic / Tylenol' },
    { name: 'Spironolactone', type: 'Diuretic' },
    { name: 'Omeprazole', type: 'Antacid / PPI' },
    { name: 'Atorvastatin', type: 'Cholesterol' }
  ];


  const PRESET_INTERACTION_PAIRS = [
    ['Warfarin', 'Aspirin'],
    ['Lisinopril', 'Spironolactone'],
    ['Metformin', 'Alcohol'],
    ['Atorvastatin', 'Clarithromycin'],
    ['Omeprazole', 'Clopidogrel']
  ];

  useEffect(() => {
    get('/medicine/history')
      .then(res => {
        const items = res.data?.data?.items || res.data?.data || [];
        setRecentSearches(items.slice(0, 6));
      })
      .catch(() => {});
  }, [result]);

  const executeSearch = async (medicineName) => {
    const term = medicineName || query;
    if (!term.trim()) {
      toast.error('Please enter a medication name');
      return;
    }

    setQuery(term);
    setLoading(true);
    setResult(null);

    try {
      const res = await post('/medicine/search', { query: term });
      if (res.data?.success && res.data?.data) {
        setResult(res.data.data);
        toast.success(`Found openFDA information for ${term}`);
      } else {
        throw new Error(res.data?.message || 'Medicine not found in openFDA database');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Error fetching medicine information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrugToInteraction = (e) => {
    if (e) e.preventDefault();
    if (!currentDrugInput.trim()) return;
    if (interactionDrugs.includes(currentDrugInput.trim())) {
      toast.error('Medication already added to interaction list');
      return;
    }
    setInteractionDrugs([...interactionDrugs, currentDrugInput.trim()]);
    setCurrentDrugInput('');
  };

  const handleRemoveDrug = (drug) => {
    setInteractionDrugs(interactionDrugs.filter(d => d !== drug));
  };

  const checkInteractions = async () => {
    if (interactionDrugs.length < 2) {
      toast.error('Please add at least 2 medications to check for interactions');
      return;
    }

    setInteractionLoading(true);
    setInteractionResult(null);

    try {
      const res = await post('/medicine/interactions', { medications: interactionDrugs });
      if (res.data?.success && res.data?.data) {
        setInteractionResult(res.data.data);
        toast.success('Drug-Drug interaction analysis completed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to analyze drug interactions. Please try again.');
    } finally {
      setInteractionLoading(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pb-10">
      {/* Page Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Medicine & Drug Guide</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              OpenFDA monographs, clinical indications, adverse reactions, and multi-drug interaction safety checker.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" /> Drug Lookup
          </TabsTrigger>
          <TabsTrigger value="interactions" className="gap-2">
            <ShieldAlert className="h-4 w-4" /> Interaction Checker
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Single Drug Search */}
        <TabsContent value="search" className="space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <form 
                onSubmit={(e) => { e.preventDefault(); executeSearch(); }} 
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <Input 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    placeholder="Search generic or brand name (e.g., Amoxicillin, Advil, Metformin)..." 
                    className="pl-10 h-11 rounded-xl text-sm"
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !query.trim()}
                  className="h-11 px-6 font-semibold gap-2 rounded-xl"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" /> Search Drug
                    </>
                  )}
                </Button>
              </form>

              {/* Quick-Search Tags */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Frequently Searched Medications:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_MEDICINES.map((med, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => executeSearch(med.name)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5"
                    >
                      <Pill className="h-3 w-3 text-purple-500" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{med.name}</span>
                      <span className="text-[10px] text-gray-400">({med.type})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="flex items-center gap-2 pt-2 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span>Your Recent Lookups:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => executeSearch(s.search_query)}
                        className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[11px] text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                      >
                        {s.search_query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Result Card */}
          {result && (
            <Card className="border-purple-500/20 shadow-md animate-in fade-in duration-300 overflow-hidden">
              <CardHeader className="bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        FDA Drug Monograph
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {result.generic_name || query.toUpperCase()}
                    </h2>
                    {result.brand_names && result.brand_names.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-xs text-gray-500">Brand Names:</span>
                        {result.brand_names.slice(0, 5).map((bn, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            {bn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-500 block">Verified Source</span>
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      {result.source || 'U.S. Food & Drug Administration (openFDA)'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    Indications & Clinical Uses
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {result.uses || 'No specific indications specified in FDA database.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4 text-amber-500" />
                    Adverse Reactions & Potential Side Effects
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {result.side_effects || 'Standard side effects not listed in FDA entry.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                    Clinical Warnings & Precautions
                  </h3>
                  <p className="text-sm leading-relaxed">
                    {result.warnings || 'Consult your prescribing doctor or pharmacist before taking this medication.'}
                  </p>
                </div>

                {result.contraindications && (
                  <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-rose-600" />
                      Contraindications (When Not To Use)
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {result.contraindications}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Multi-Drug Interaction Checker */}
        <TabsContent value="interactions" className="space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                Multi-Medication Safety & Interaction Checker
              </CardTitle>
              <p className="text-xs text-gray-500">
                Add 2 or more prescription or over-the-counter drugs to detect dangerous interactions and synergistic side effects.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Input for adding drug to list */}
              <form onSubmit={handleAddDrugToInteraction} className="flex gap-2">
                <Input
                  value={currentDrugInput}
                  onChange={(e) => setCurrentDrugInput(e.target.value)}
                  placeholder="Enter medication to add (e.g. Warfarin, Aspirin, Lisinopril)..."
                  className="h-11 rounded-xl text-sm"
                />
                <Button type="submit" variant="outline" className="h-11 px-4 gap-1.5">
                  <Plus className="h-4 w-4" /> Add Drug
                </Button>
              </form>

              {/* Current Added Drugs Badges */}
              <div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                  Active Drug List ({interactionDrugs.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {interactionDrugs.map((drug, i) => (
                    <div 
                      key={i} 
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-semibold flex items-center gap-2"
                    >
                      <Pill className="h-3.5 w-3.5 text-purple-500" />
                      <span>{drug}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDrug(drug)}
                        className="hover:text-red-500 transition-colors ml-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preset Drug Combination Pairs */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <span className="text-[11px] font-semibold text-gray-500 block">
                  Quick-load common clinical test pairs:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_INTERACTION_PAIRS.map((pair, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInteractionDrugs(pair);
                        setInteractionResult(null);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary/50 text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-all"
                    >
                      {pair.join(' + ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <Button
                  onClick={checkInteractions}
                  disabled={interactionDrugs.length < 2 || interactionLoading}
                  className="w-full h-11 font-bold text-sm gap-2"
                >
                  {interactionLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing Pharmacological Interactions...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" /> Run Interaction Check ({interactionDrugs.length} Drugs)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Interaction Results Display */}
          {interactionResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Summary Card */}
              <div className={`p-5 rounded-2xl border ${
                interactionResult.safety_level === 'High Risk Alert'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                  : interactionResult.safety_level === 'Caution Advised'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {interactionResult.safety_level === 'High Risk Alert' ? (
                    <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
                  ) : interactionResult.safety_level === 'Caution Advised' ? (
                    <AlertOctagon className="h-6 w-6 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-extrabold text-base">
                      {interactionResult.safety_level}
                    </h3>
                    <p className="text-xs opacity-90 mt-0.5">
                      {interactionResult.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Interaction Cards */}
              {interactionResult.interactions.map((item, idx) => (
                <Card key={idx} className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className={`px-5 py-3 border-b flex items-center justify-between ${
                    item.severity === 'major' 
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200' 
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
                  }`}>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {item.drug_1} ⇄ {item.drug_2}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      item.severity === 'major' ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100' : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                    }`}>
                      {item.severity} severity
                    </span>
                  </div>
                  <CardContent className="p-5 space-y-3 text-xs leading-relaxed">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h4>
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300 block mb-0.5">Risk Summary:</strong>
                      <p className="text-gray-600 dark:text-gray-400">{item.risk}</p>
                    </div>
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300 block mb-0.5">Pharmacological Mechanism:</strong>
                      <p className="text-gray-600 dark:text-gray-400">{item.mechanism}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-950 dark:text-blue-200">
                      <strong className="block font-semibold mb-0.5">Clinical Recommendation:</strong>
                      {item.recommendation}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Disclaimer />
    </div>
  );
};


