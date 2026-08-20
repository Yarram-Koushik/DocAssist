import React from 'react';
import { Card, CardContent } from '../ui/card';

export const QuickActions = ({ actions, onActionClick }) => (
  <div className="grid md:grid-cols-3 gap-4">
    {actions.map((action, i) => (
      <Card key={i} className="hover:border-primary cursor-pointer transition-colors" onClick={() => onActionClick(action.path)}>
        <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <action.icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">{action.title}</h3>
            <p className="text-sm text-gray-500">{action.desc}</p>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
