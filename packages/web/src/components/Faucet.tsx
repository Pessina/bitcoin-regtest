import { useMutation } from '@tanstack/react-query';
import { Droplet, Send } from 'lucide-react';
import { useState } from 'react';

import { api } from '../lib/api';
import { CopyableAddress } from './CopyableAddress';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export function Faucet() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txid, setTxid] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ addr, amt }: { addr: string; amt: number }) =>
      api.sendFunds(addr, amt),
    onSuccess: (data) => {
      setTxid(data);
      setAddress('');
      setAmount('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (address.trim() && !isNaN(amt) && amt > 0) {
      mutation.mutate({ addr: address.trim(), amt });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5" />
          Regtest Faucet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Recipient Address
            </label>
            <Input
              id="address"
              type="text"
              placeholder="Enter Bitcoin address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount (BTC)
            </label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              min="0"
              placeholder="Enter amount in BTC..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {mutation.isPending ? 'Sending...' : 'Send Funds'}
          </Button>
        </form>

        {mutation.isPending && (
          <div className="flex items-center justify-center py-8 mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {mutation.isError && (
          <div className="text-destructive p-4 border border-destructive rounded-lg mt-4">
            Failed to send funds. Make sure the address is valid and the amount
            is correct.
          </div>
        )}

        {txid && !mutation.isPending && (
          <div className="mt-4 space-y-4">
            <div className="border rounded-lg p-4 bg-accent/50">
              <div className="flex items-center gap-2 mb-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Transaction ID</span>
              </div>
              <CopyableAddress
                address={txid}
                truncate={false}
                className="text-xs bg-background px-2 py-1 rounded font-mono justify-between w-full"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Funds sent successfully! The transaction will be included in the
              next mined block.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
