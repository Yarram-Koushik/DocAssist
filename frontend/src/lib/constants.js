import { Home, MessageSquare, FileText, Search, Clock, User, Settings } from 'lucide-react';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
export const API_URL = rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`) : '/api';
export const APP_NAME = 'DocAssist';


export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Consultations', path: '/chat', icon: MessageSquare },
  { label: 'Lab Report Analyzer', path: '/upload-report', icon: FileText },
  { label: 'Medicine & Drug Guide', path: '/medicine-search', icon: Search },
  { label: 'Health History', path: '/history', icon: Clock },
  { label: 'Patient Medical ID', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const REPORT_TYPES = [
  'CBC',
  'Thyroid',
  'Blood Sugar',
  'Lipid Profile',
  'Liver Function',
  'Kidney Function',
  'Other'
];

