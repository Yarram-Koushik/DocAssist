import React from 'react';
import { Card, CardContent } from '../ui/card';

export const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {stats.map((s, i) => (
      <Card key={i}>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
          <s.icon className={`h-8 w-8 ${s.color} opacity-20`} />
        </CardContent>
      </Card>
    ))}
  </div>
);
