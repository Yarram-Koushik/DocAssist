import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  User, 
  Heart, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  Activity, 
  Plus, 
  X, 
  Printer, 
  Sparkles,
  Calendar,
  Check
} from 'lucide-react';
import { put, get } from '../lib/api';
import { toast } from 'react-hot-toast';

export const ProfilePage = () => {
  const { user } = useAuth();
  
  // Profile State
  const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
  const [dob, setDob] = useState(user?.date_of_birth || '');
  const [gender, setGender] = useState(user?.gender || 'prefer_not_to_say');
  const [bloodType, setBloodType] = useState('O+');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  
  // Allergies & Conditions State
  const [allergies, setAllergies] = useState(['Penicillin (Mild rash)', 'Peanuts']);
  const [allergyInput, setAllergyInput] = useState('');
  const [conditions, setConditions] = useState(['Mild Asthma']);
  const [conditionInput, setConditionInput] = useState('');
  
  // Emergency Contact State
  const [emergencyContact, setEmergencyContact] = useState({
    name: 'Sarah Doe',
    relationship: 'Spouse',
    phone: '+1 (555) 234-5678'
  });

  const [loading, setLoading] = useState(false);

  // Compute BMI
  const heightInM = Number(height) / 100;
  const bmi = (heightInM > 0 && Number(weight) > 0) 
    ? (Number(weight) / (heightInM * heightInM)).toFixed(1) 
    : 'N/A';
  
  const getBmiCategory = (bmiVal) => {
    const val = Number(bmiVal);
    if (!val || isNaN(val)) return { label: 'Normal', color: 'text-emerald-500' };
    if (val < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (val < 25) return { label: 'Healthy Weight', color: 'text-emerald-500' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-500' };
    return { label: 'Obese', color: 'text-rose-500' };
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await put('/auth/me', { 
        full_name: fullName,
        date_of_birth: dob || null,
        gender: gender || null
      });
      toast.success('Clinical health profile updated successfully!');
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllergy = (e) => {
    if (e) e.preventDefault();
    if (!allergyInput.trim()) return;
    if (!allergies.includes(allergyInput.trim())) {
      setAllergies([...allergies, allergyInput.trim()]);
    }
    setAllergyInput('');
  };

  const handleRemoveAllergy = (item) => {
    setAllergies(allergies.filter(a => a !== item));
  };

  const handleAddCondition = (e) => {
    if (e) e.preventDefault();
    if (!conditionInput.trim()) return;
    if (!conditions.includes(conditionInput.trim())) {
      setConditions([...conditions, conditionInput.trim()]);
    }
    setConditionInput('');
  };

  const handleRemoveCondition = (item) => {
    setConditions(conditions.filter(c => c !== item));
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pb-10">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Patient Health Profile & Records</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Maintain your clinical baselines, known allergies, chronic conditions, and emergency medical card.
          </p>
        </div>
        <Button onClick={handlePrintCard} variant="outline" size="sm" className="gap-2 text-xs">
          <Printer className="h-4 w-4" /> Print Emergency Medical Card
        </Button>
      </div>
      
      {/* Grid: Left column (Demographics & Vitals) / Right column (Allergies & Emergency) */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* 1. Demographics & Identity */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <User className="h-4 w-4 text-primary" /> Patient Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Full Legal Name</label>
              <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="h-10 text-sm"
                placeholder="Dr. / Mr. / Ms. Full Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Username</label>
                <Input defaultValue={user?.username} disabled className="h-10 bg-gray-50 dark:bg-gray-800 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Date of Birth</label>
                <Input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Primary Email (Locked)</label>
              <Input defaultValue={user?.email} disabled className="h-10 bg-gray-50 dark:bg-gray-800 text-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Biological Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-gray-100"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 2. Physiological Baseline & BMI */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Activity className="h-4 w-4 text-emerald-500" /> Physical Baselines & BMI Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Blood Type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-red-600"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Height (cm)</label>
                <Input 
                  type="number"
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)} 
                  className="h-10 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Weight (kg)</label>
                <Input 
                  type="number"
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  className="h-10 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Calculated BMI Badge */}
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  Body Mass Index (BMI)
                </span>
                <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{bmi} <span className="text-xs font-normal text-gray-500">kg/m²</span></span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-extrabold ${getBmiCategory(bmi).color} block`}>
                  {getBmiCategory(bmi).label}
                </span>
                <span className="text-[10px] text-gray-400">Healthy range: 18.5 - 24.9</span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button onClick={handleSave} disabled={loading} className="w-full font-semibold text-xs h-10 gap-2">
                <Check className="h-4 w-4" /> {loading ? 'Saving Profile...' : 'Save Profile Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allergies, Chronic Conditions & Emergency Contact */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Known Allergies & Sensitivities */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <AlertCircle className="h-4 w-4 text-rose-500" /> Known Allergies & Sensitivities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <form onSubmit={handleAddAllergy} className="flex gap-2">
              <Input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, Peanuts, Latex..."
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" variant="outline" className="h-9 text-xs gap-1 shrink-0">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </form>

            <div className="flex flex-wrap gap-1.5 min-h-[48px]">
              {allergies.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No known allergies recorded.</span>
              ) : (
                allergies.map((item, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs font-medium flex items-center gap-1.5"
                  >
                    {item}
                    <button type="button" onClick={() => handleRemoveAllergy(item)} className="hover:text-rose-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Phone className="h-4 w-4 text-blue-500" /> Primary Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500">Contact Name</label>
                <Input
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact({...emergencyContact, name: e.target.value})}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500">Relationship</label>
                <Input
                  value={emergencyContact.relationship}
                  onChange={(e) => setEmergencyContact({...emergencyContact, relationship: e.target.value})}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500">Emergency Phone Number</label>
              <Input
                value={emergencyContact.phone}
                onChange={(e) => setEmergencyContact({...emergencyContact, phone: e.target.value})}
                className="h-9 text-xs font-semibold text-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Medical Card Preview Banner */}
      <Card className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg border-0 overflow-hidden print:m-0 print:border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white text-red-600 font-black text-xs">EMERGENCY</div>
              <span className="font-extrabold text-sm tracking-wide">DOCASSIST PATIENT MEDICAL ID</span>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-bold">Blood: {bloodType}</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-white/70 block text-[10px] uppercase font-bold">Patient Name</span>
              <span className="font-bold text-sm">{fullName || user?.username || 'Patient'}</span>
            </div>
            <div>
              <span className="text-white/70 block text-[10px] uppercase font-bold">Allergies</span>
              <span className="font-semibold">{allergies.join(', ') || 'NKDA (None Known)'}</span>
            </div>
            <div>
              <span className="text-white/70 block text-[10px] uppercase font-bold">Emergency ICE Contact</span>
              <span className="font-semibold">{emergencyContact.name} ({emergencyContact.relationship}): {emergencyContact.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

