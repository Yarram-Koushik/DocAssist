import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export const MetricsGrid = ({ metrics }) => (
  <div className="grid md:grid-cols-3 gap-6">
    {metrics.map((m, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">{m.title}</CardTitle>
          <m.icon className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{m.value}</div>
        </CardContent>
      </Card>
    ))}
  </div>
);
