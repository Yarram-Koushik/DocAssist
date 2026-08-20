import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Share2, Printer } from 'lucide-react';

export const DoctorSummary = ({ summary }) => (
  <Card className="border-primary/20 shadow-md">
    <CardHeader className="bg-primary/5 pb-4 border-b">
      <div className="flex justify-between items-center">
        <CardTitle>Summary for Doctor</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm"><Printer className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm"><Share2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-6 space-y-4">
      <div>
        <h4 className="font-semibold text-gray-700">Patient Profile</h4>
        <p className="text-sm">{summary.patientInfo}</p>
      </div>
      <div>
        <h4 className="font-semibold text-gray-700">Key Symptoms</h4>
        <ul className="list-disc pl-5 text-sm">
          {summary.symptoms.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-gray-700">Relevant History</h4>
        <p className="text-sm">{summary.history}</p>
      </div>
    </CardContent>
  </Card>
);
