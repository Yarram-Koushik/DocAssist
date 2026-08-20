import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export const RecentActivity = ({ activities }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {activities.map((item, i) => (
        <div key={i} className="flex items-center space-x-4 border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0">
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <item.icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-gray-500">{item.time}</p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);
