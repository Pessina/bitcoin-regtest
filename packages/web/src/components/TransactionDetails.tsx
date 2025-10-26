import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock,
  Coins,
  Copy,
  Database,
  Hash,
} from 'lucide-react';
import { useState } from 'react';

import { api } from '../lib/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface TransactionDetailsProps {
  txid: string;
  onBack: () => void;
}

export function TransactionDetails({ txid, onBack }: TransactionDetailsProps) {
  const [copied, setCopied] = useState(false);
  const {
    data: tx,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['transaction', txid],
    queryFn: () => api.getTransaction(txid),
    enabled: !!txid,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(txid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-destructive p-4 border border-destructive rounded-lg">
              Failed to fetch transaction details. Make sure the transaction ID
              is valid.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCoinbase = tx.inputs[0]?.isCoinbase;

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" size="sm">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Explorer
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction Details</CardTitle>
            {isCoinbase && <Badge variant="secondary">Mining Reward</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-accent/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Transaction ID</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <code className="text-xs bg-background px-2 py-1 rounded font-mono block break-all">
                {tx.txid}
              </code>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <div className="text-sm">
                  {new Date(tx.time * 1000).toLocaleString()}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Block</span>
                </div>
                <div className="text-sm">#{tx.blockHeight}</div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Output</span>
                </div>
                <div className="text-sm font-semibold">
                  {tx.totalOutput.toFixed(8)} BTC
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpRight className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">
                    Inputs ({tx.inputs.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {isCoinbase ? (
                    <div className="text-sm text-muted-foreground">
                      Newly Generated Coins (Coinbase)
                    </div>
                  ) : (
                    tx.inputs.map((input, idx) => (
                      <div
                        key={`${input.txid}-${input.vout}-${idx}`}
                        className="border-b pb-2 last:border-0"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-xs font-mono text-muted-foreground">
                            {input.address
                              ? `${input.address.slice(0, 12)}...${input.address.slice(-12)}`
                              : 'Unknown'}
                          </code>
                          <span className="text-xs font-semibold">
                            {input.value?.toFixed(8) || '?'} BTC
                          </span>
                        </div>
                        {input.txid && (
                          <div className="text-xs text-muted-foreground">
                            {input.txid.slice(0, 16)}...:{input.vout}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDownLeft className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    Outputs ({tx.outputs.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {tx.outputs.map((output) => (
                    <div key={output.n} className="border-b pb-2 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-xs font-mono text-muted-foreground">
                          {output.address
                            ? `${output.address.slice(0, 12)}...${output.address.slice(-12)}`
                            : `${output.scriptType} (no address)`}
                        </code>
                        <span className="text-xs font-semibold">
                          {output.value.toFixed(8)} BTC
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Output #{output.n}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="grid gap-4 md:grid-cols-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Size:</span>{' '}
                  <span className="font-medium">{tx.size} bytes</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Virtual Size:</span>{' '}
                  <span className="font-medium">{tx.vsize} vB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Weight:</span>{' '}
                  <span className="font-medium">{tx.weight} WU</span>
                </div>
                {!isCoinbase && (
                  <div>
                    <span className="text-muted-foreground">Fee:</span>{' '}
                    <span className="font-medium">{tx.fee.toFixed(8)} BTC</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
