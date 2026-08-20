import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';

export const MedicineSearch = ({ query, setQuery, onSearch, loading }) => (
  <form onSubmit={onSearch} className="flex gap-2">
    <Input 
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search medicines..."
      className="flex-1"
    />
    <Button type="submit" disabled={loading}>
      <Search className="h-4 w-4 mr-2" />
      Search
    </Button>
  </form>
);
