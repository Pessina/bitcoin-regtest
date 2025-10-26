import { useInfiniteQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Coins,
  Database,
  Filter,
  Hash,
  Loader2,
  Package,
} from 'lucide-react';
import { useState } from 'react';

import { api, type RecentTransaction } from '../lib/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

function formatAddress(address: string | undefined): string {
  if (!address) return 'Unknown';
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

type TransactionFilter = 'all' | 'hide-rewards' | 'only-rewards';

const TRANSACTIONS_PER_PAGE = 10;

export function TransactionList() {
  const [filter, setFilter] = useState<TransactionFilter>('all');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['transactions', 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      api.getLatestTransactions(TRANSACTIONS_PER_PAGE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < TRANSACTIONS_PER_PAGE) return undefined;
      return allPages.length * TRANSACTIONS_PER_PAGE;
    },
    initialPageParam: 0,
    refetchInterval: 10000,
  });

  const allTransactions = data?.pages.flat() ?? [];

  const filteredTransactions = allTransactions.filter(
    (tx: RecentTransaction) => {
      const isCoinbase = tx.inputs[0]?.isCoinbase;
      if (filter === 'hide-rewards') return !isCoinbase;
      if (filter === 'only-rewards') return isCoinbase;
      return true;
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Latest Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              Loading transactions...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Latest Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-destructive mb-4">
              Failed to load transactions
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Transaction History
              {allTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {allTransactions.length}
                </Badge>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'hide-rewards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('hide-rewards')}
              >
                Hide Rewards
              </Button>
              <Button
                variant={filter === 'only-rewards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('only-rewards')}
              >
                Only Rewards
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions match the selected filter
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions?.map((tx: RecentTransaction) => {
              const time = Number(tx.time);
              const size = Number(tx.size);
              const vsize = Number(tx.vsize);
              const totalOutput = Number(tx.totalOutput);
              const fee = Number(tx.fee);
              const isCoinbase = tx.inputs[0]?.isCoinbase;

              return (
                <div key={tx.txid} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        {isCoinbase ? 'Coinbase Transaction' : 'Transaction'}
                      </span>
                      {isCoinbase && (
                        <Badge variant="secondary" className="text-xs">
                          Mining Reward
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(time * 1000).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {tx.txid.slice(0, 16)}...{tx.txid.slice(-16)}
                    </code>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="border rounded-lg p-3 bg-background">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-medium text-muted-foreground">
                          From ({tx.inputs.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {isCoinbase ? (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Newly Generated Coins
                            </span>
                          </div>
                        ) : (
                          tx.inputs.slice(0, 3).map((input, idx) => (
                            <div
                              key={`${input.txid}-${input.vout}-${idx}`}
                              className="text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <code className="text-xs font-mono text-muted-foreground">
                                  {formatAddress(input.address)}
                                </code>
                                <span className="text-xs font-semibold">
                                  {input.value?.toFixed(8) || '?'} BTC
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                        {!isCoinbase && tx.inputs.length > 3 && (
                          <div className="text-xs text-muted-foreground pt-1">
                            +{tx.inputs.length - 3} more input
                            {tx.inputs.length - 3 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border rounded-lg p-3 bg-background">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium text-muted-foreground">
                          To ({tx.outputs.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {tx.outputs.slice(0, 3).map((output) => (
                          <div key={`${output.n}`} className="text-sm">
                            <div className="flex items-center justify-between">
                              <code className="text-xs font-mono text-muted-foreground">
                                {formatAddress(output.address)}
                              </code>
                              <span className="text-xs font-semibold">
                                {output.value.toFixed(8)} BTC
                              </span>
                            </div>
                          </div>
                        ))}
                        {tx.outputs.length > 3 && (
                          <div className="text-xs text-muted-foreground pt-1">
                            +{tx.outputs.length - 3} more output
                            {tx.outputs.length - 3 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Database className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Block #{tx.blockHeight}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-4 text-sm text-muted-foreground border-t pt-2">
                    <div className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      <span className="text-xs">
                        Total: {totalOutput.toFixed(8)} BTC
                      </span>
                    </div>
                    {!isCoinbase && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">
                          Fee: {fee.toFixed(8)} BTC
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-xs">
                        {size} bytes ({vsize} vB)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredTransactions.length > 0 && hasNextPage && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
              size="lg"
              className="w-full max-w-md"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Load More Transactions
                </>
              )}
            </Button>
          </div>
        )}

        {!hasNextPage && filteredTransactions.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground py-4 border-t">
            You've reached the end of the transaction history
          </div>
        )}
      </CardContent>
    </Card>
  );
}
