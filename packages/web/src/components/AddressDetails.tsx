import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Coins,
  Wallet,
  Clock,
} from 'lucide-react';

import { api } from '../lib/api';
import { CopyableAddress } from './CopyableAddress';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AddressDetailsProps {
  address: string;
  onBack: () => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function AddressDetails({ address, onBack }: AddressDetailsProps) {
  const {
    data: result,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['address', address],
    queryFn: () => api.getAddressBalance(address),
    enabled: !!address,
  });

  const { data: blockchainInfo } = useQuery({
    queryKey: ['blockchainInfo'],
    queryFn: () => api.getBlockchainInfo(),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
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

  if (error || !result) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-destructive p-4 border border-destructive rounded-lg">
              Failed to fetch address details. Make sure the address is valid.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" size="sm">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Explorer
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Address Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-accent/50">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Address</span>
                </div>
                <QRCodeDisplay value={result.address} title="Address QR Code" />
              </div>
              <CopyableAddress
                address={result.address}
                truncate={false}
                className="text-xs"
              />
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
                  {result.utxos.map((utxo, idx) => {
                    const age = blockchainInfo ? blockchainInfo.blocks - utxo.height : 0;
                    return (
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
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>Height: {utxo.height}</span>
                          {blockchainInfo && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{age} block{age !== 1 ? 's' : ''} old</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result.transactions.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Transaction History</h3>
                <div className="space-y-3">
                  {result.transactions.map((tx) => (
                    <div
                      key={tx.txid}
                      className="text-sm border-b pb-3 last:border-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {tx.type === 'incoming' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              tx.type === 'incoming'
                                ? 'text-green-600 font-medium'
                                : 'text-red-600 font-medium'
                            }
                          >
                            {tx.type === 'incoming' ? 'Received' : 'Sent'}
                          </span>
                        </div>
                        <span className="font-semibold">
                          {tx.type === 'incoming' ? '+' : '-'}
                          {tx.amount} BTC
                        </span>
                      </div>
                      <code className="text-xs text-muted-foreground font-mono block">
                        {tx.txid.slice(0, 32)}...
                      </code>
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>{formatDate(tx.time)}</span>
                        <span>
                          {tx.confirmations} confirmation
                          {tx.confirmations !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Block: {tx.blockHeight}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
