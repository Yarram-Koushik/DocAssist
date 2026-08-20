import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';

export const ChatInput = ({ value, onChange, onSend, disabled }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="flex gap-2 w-full">
    <Input 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your medical query..."
      disabled={disabled}
      className="flex-1"
    />
    <Button type="submit" disabled={disabled || !value.trim()}>
      <Send className="h-4 w-4" />
    </Button>
  </form>
);
