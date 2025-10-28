import { useInfiniteQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Coins,
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
import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { formatTimeAgoWithTooltip } from '../lib/timeUtils';

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
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-600 mb-4">
            Failed to load transactions
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          {allTransactions.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {allTransactions.length}
            </Badge>
          )}
        </div>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as TransactionFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hide-rewards">Normal</TabsTrigger>
            <TabsTrigger value="only-rewards">Rewards</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="space-y-4">
        {filteredTransactions?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions match the selected filter
          </div>
        ) : (
          <TooltipProvider>
            {filteredTransactions?.map((tx: RecentTransaction) => {
              const time = Number(tx.time);
              const vsize = Number(tx.vsize);
              const totalOutput = Number(tx.totalOutput);
              const fee = Number(tx.fee);
              const isCoinbase = tx.inputs[0]?.isCoinbase;
              const { timeAgo, fullDate } = formatTimeAgoWithTooltip(time);

              return (
                <div
                  key={tx.txid}
                  onClick={() => window.location.hash = `tx/${tx.txid}`}
                  className="border rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {timeAgo}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{fullDate}</p>
                      </TooltipContent>
                    </Tooltip>
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
          </TooltipProvider>
        )}
      </div>

      {filteredTransactions.length > 0 && hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="w-full"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More
              </>
            )}
          </Button>
        </div>
      )}

      {!hasNextPage && filteredTransactions.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500 py-4 border-t">
          End of history
        </div>
      )}
    </Card>
  );
}
