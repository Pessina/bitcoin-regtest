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

    let type: 'address' | 'transaction';

    if (trimmedQuery.length === 64) {
      type = 'transaction';
    } else if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmedQuery) ||
               /^bc1[a-z0-9]{39,87}$/.test(trimmedQuery)) {
      type = 'address';
    } else if (trimmedQuery.length === 64 && /^[0-9a-fA-F]{64}$/.test(trimmedQuery)) {
      type = 'transaction';
    } else {
      type = 'address';
    }

    onSearch(trimmedQuery, type);
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1 max-w-2xl">
      <Input
        type="text"
        placeholder="Search address, transaction ID, or block hash..."
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
