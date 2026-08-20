import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export const MedicineCard = ({ medicine }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-primary">{medicine.name}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Uses</h4>
        <p className="text-sm">{medicine.uses}</p>
      </div>
      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Side Effects</h4>
        <p className="text-sm">{medicine.sideEffects}</p>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm">
        <h4 className="font-semibold mb-1">Warnings</h4>
        <p>{medicine.warnings}</p>
      </div>
    </CardContent>
  </Card>
);
