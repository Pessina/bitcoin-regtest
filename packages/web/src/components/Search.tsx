import { Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from './ui/button';
import { Input } from './ui/input';

interface SearchProps {
  onSearch: (query: string, type: 'address' | 'transaction') => void;
}

export function Search({ onSearch }: SearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    const type = trimmedQuery.length === 64 ? 'transaction' : 'address';
    onSearch(trimmedQuery, type);
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1 max-w-2xl">
      <Input
        type="text"
        placeholder="Search by address or transaction ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="sm">
        <SearchIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}
