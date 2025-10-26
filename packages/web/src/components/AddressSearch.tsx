import { Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface AddressSearchProps {
  onSearch: (address: string) => void;
}

export function AddressSearch({ onSearch }: AddressSearchProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address.trim());
      setAddress('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter Bitcoin address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Search for a Bitcoin address to view its balance and transaction
          history
        </p>
      </CardContent>
    </Card>
  );
}
