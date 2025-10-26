import { useInfiniteQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Coins,
  Filter,
  Hash,
  Layers,
  Loader2,
  Package,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import { api, type RecentTransaction } from '../lib/api';
import { CopyableAddress } from './CopyableAddress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
              const vsize = Number(tx.vsize);
              const totalOutput = Number(tx.totalOutput);
              const fee = Number(tx.fee);
              const isCoinbase = tx.inputs[0]?.isCoinbase;

              return (
                <div
                  key={tx.txid}
                  className="border rounded-lg p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isCoinbase ? (
                        <Zap className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Layers className="h-4 w-4 text-blue-500" />
                      )}
                      {isCoinbase && (
                        <Badge variant="secondary" className="text-xs">
                          Mining Reward
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        #{tx.blockHeight}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(time * 1000).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <CopyableAddress
                      address={tx.txid}
                      className="flex-1"
                      truncate={true}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mb-2">
                    <div className="border rounded p-2 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <ArrowUpRight className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-medium">
                          Inputs ({tx.inputs.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {isCoinbase ? (
                          <div className="text-xs text-muted-foreground italic">
                            Coinbase (New Coins)
                          </div>
                        ) : (
                          tx.inputs.slice(0, 2).map((input, idx) => (
                            <div
                              key={`${input.txid}-${input.vout}-${idx}`}
                              className="flex items-center justify-between gap-2"
                            >
                              {input.address ? (
                                <CopyableAddress
                                  address={input.address}
                                  className="flex-1"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Unknown
                                </span>
                              )}
                              <span className="text-xs font-semibold whitespace-nowrap">
                                {input.value?.toFixed(4) || '?'} BTC
                              </span>
                            </div>
                          ))
                        )}
                        {!isCoinbase && tx.inputs.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{tx.inputs.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border rounded p-2 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs font-medium">
                          Outputs ({tx.outputs.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {tx.outputs.slice(0, 2).map((output) => (
                          <div
                            key={output.n}
                            className="flex items-center justify-between gap-2"
                          >
                            {output.address ? (
                              <CopyableAddress
                                address={output.address}
                                className="flex-1"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {output.scriptType}
                              </span>
                            )}
                            <span className="text-xs font-semibold whitespace-nowrap">
                              {output.value.toFixed(4)} BTC
                            </span>
                          </div>
                        ))}
                        {tx.outputs.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{tx.outputs.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        <span>{totalOutput.toFixed(4)} BTC</span>
                      </div>
                      {!isCoinbase && fee > 0 && (
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>{fee.toFixed(6)} fee</span>
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground/70">{vsize} vB</span>
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
