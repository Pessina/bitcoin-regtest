import { useState } from 'react';
import { api } from '../lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Radio, CheckCircle2, AlertCircle } from 'lucide-react';

export function TransactionBroadcast() {
  const [rawTx, setRawTx] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleBroadcast = async () => {
    if (!rawTx.trim()) {
      setResult({ success: false, message: 'Please enter a transaction hex' });
      return;
    }

    setBroadcasting(true);
    setResult(null);

    try {
      const txid = await api.sendRawTransaction(rawTx.trim());
      setResult({
        success: true,
        message: `Transaction broadcast successfully! TXID: ${txid}`,
      });
      setRawTx('');
    } catch (error) {
      setResult({
        success: false,
        message: `Failed to broadcast: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setBroadcasting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setRawTx('');
    setResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Radio className="h-4 w-4" />
          Broadcast Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Broadcast Raw Transaction</DialogTitle>
          <DialogDescription>
            Enter a signed raw transaction hex to broadcast to the network
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Hex</label>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              placeholder="01000000..."
              value={rawTx}
              onChange={(e) => setRawTx(e.target.value)}
              disabled={broadcasting}
            />
          </div>

          {result && (
            <Alert variant={result.success ? 'success' : 'destructive'}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription className="break-all">{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={broadcasting}>
              Close
            </Button>
            <Button onClick={handleBroadcast} disabled={broadcasting || !rawTx.trim()}>
              {broadcasting ? 'Broadcasting...' : 'Broadcast'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
