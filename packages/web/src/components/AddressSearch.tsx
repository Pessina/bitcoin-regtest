import { useMutation } from '@tanstack/react-query';
import { Coins, Search, Wallet } from 'lucide-react';
import { useState } from 'react';

import { type AddressBalance, api } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export function AddressSearch() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<AddressBalance | null>(null);

  const mutation = useMutation({
    mutationFn: (addr: string) => api.getAddressBalance(addr),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      mutation.mutate(address.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Balance Query</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Enter Bitcoin address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={mutation.isPending}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        {mutation.isPending && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {mutation.isError && (
          <div className="text-destructive p-4 border border-destructive rounded-lg">
            Failed to fetch address balance. Make sure the address is valid.
          </div>
        )}

        {result && !mutation.isPending && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-accent/50">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <code className="text-xs bg-background px-2 py-1 rounded font-mono block break-all">
                {result.address}
              </code>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Balance</span>
                </div>
                <div className="text-2xl font-bold">{result.balance} BTC</div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">UTXOs</span>
                </div>
                <div className="text-2xl font-bold">{result.utxoCount}</div>
              </div>
            </div>

            {result.utxos.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Unspent Outputs</h3>
                <div className="space-y-2">
                  {result.utxos.map((utxo, idx) => (
                    <div
                      key={`${utxo.txid}-${utxo.vout}`}
                      className="text-sm border-b pb-2 last:border-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          UTXO #{idx + 1}
                        </span>
                        <span className="font-semibold">{utxo.amount} BTC</span>
                      </div>
                      <code className="text-xs text-muted-foreground font-mono block mt-1">
                        {utxo.txid.slice(0, 16)}...:{utxo.vout}
                      </code>
                      <div className="text-xs text-muted-foreground mt-1">
                        Height: {utxo.height}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
