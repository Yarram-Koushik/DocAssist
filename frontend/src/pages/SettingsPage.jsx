import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Lock, 
  Moon, 
  Sun, 
  Volume2, 
  Bell, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Check, 
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { put, get } from '../lib/api';
import { toast } from 'react-hot-toast';

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Accessibility State
  const [speechRate, setSpeechRate] = useState('1.0');
  const [highContrast, setHighContrast] = useState(false);

  // Notification State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please provide both current and new passwords.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      await put('/auth/me/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const [reportsRes, chatsRes, medRes] = await Promise.allSettled([
        get('/reports/'),
        get('/chat/conversations'),
        get('/medicine/history')
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        application: 'DocAssist AI Health Records',
        reports: reportsRes.status === 'fulfilled' ? reportsRes.value.data?.data : [],
        conversations: chatsRes.status === 'fulfilled' ? chatsRes.value.data?.data : [],
        medicines: medRes.status === 'fulfilled' ? medRes.value.data?.data : []
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DocAssist_Health_Data_Export_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Health data archive downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export health records');
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account & System Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage password security, clinical voice assistant settings, and health data exports.
        </p>
      </div>

      {/* 1. Security & Password Management */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <KeyRound className="h-4 w-4 text-primary" /> Password & Authentication Security
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Current Password</label>
              <Input 
                type={showPasswords ? "text" : "password"} 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">New Password</label>
              <Input 
                type={showPasswords ? "text" : "password"} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars, 1 letter, 1 number"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Confirm New Password</label>
              <Input 
                type={showPasswords ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showPasswords} 
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Show passwords</span>
              </label>

              <Button type="submit" disabled={passwordLoading} size="sm" className="font-semibold text-xs px-5">
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Appearance & Accessibility */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Volume2 className="h-4 w-4 text-purple-500" /> Appearance & Speech Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5 divide-y divide-gray-100 dark:divide-gray-800">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between pb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Display Theme</p>
              <p className="text-xs text-gray-500">Switch between light clinical aesthetic and dark mode</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2 text-xs font-semibold">
              {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-purple-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Button>
          </div>

          {/* Voice Speech Rate */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Text-to-Speech Playback Speed</p>
              <p className="text-xs text-gray-500">Speed when DocAssist reads medical explanations aloud</p>
            </div>
            <div className="flex gap-1.5">
              {['0.8', '1.0', '1.2'].map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => { setSpeechRate(rate); toast.success(`Voice speed set to ${rate}x`); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    speechRate === rate 
                      ? 'bg-primary text-white shadow-xs' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Privacy & Data Archive Export */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Download className="h-4 w-4 text-emerald-500" /> Data Privacy & Medical Export
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Download Complete Medical Record Archive</p>
              <p className="text-xs text-gray-500 max-w-md">
                Export all your consultation histories, extracted lab test parameters, and medicine searches into an encrypted JSON file.
              </p>
            </div>
            <Button onClick={handleExportData} variant="outline" size="sm" className="gap-2 text-xs font-semibold">
              <Download className="h-4 w-4" /> Export All Data (.json)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

