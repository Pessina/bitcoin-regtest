import { useQuery } from '@tanstack/react-query';
import { ArrowDownUp, Clock, Coins, Hash } from 'lucide-react';

import { api, RecentTransaction } from '../lib/api';
import { formatTimeAgoWithTooltip } from '../lib/timeUtils';
import { CopyableAddress } from './CopyableAddress';
import { ScriptTypeLabel } from './ScriptTypeLabel';
import { TransactionBadges } from './TransactionBadges';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function MempoolView() {
  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery<RecentTransaction[]>({
    queryKey: ['mempoolTransactions'],
    queryFn: () => api.getMempoolTransactions(),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">Failed to load mempool transactions</div>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No unconfirmed transactions in mempool</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <TooltipProvider>
        {transactions.map((tx) => {
          const isSegWit = tx.weight < tx.size * 4;
          const feeRate = tx.fee / tx.vsize;
          const { timeAgo, fullDate } = formatTimeAgoWithTooltip(tx.time);

          return (
            <Card
              key={tx.txid}
              onClick={() => (window.location.hash = `tx/${tx.txid}`)}
              className="p-6 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <CopyableAddress
                        address={tx.txid}
                        truncate
                        className="font-mono text-sm"
                      />
                    </div>
                    <TransactionBadges isSegWit={isSegWit} />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-500 mb-1">Fee Rate</div>
                    <div className="text-lg font-bold text-amber-600">
                      {feeRate.toFixed(1)} sat/vB
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Fee</div>
                      <div className="font-medium text-gray-900">
                        {(tx.fee * 100000000).toFixed(0)} sats
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Size</div>
                      <div className="font-medium text-gray-900">
                        {tx.vsize} vB
                      </div>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Time</div>
                          <div className="font-medium text-gray-900">
                            {timeAgo}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{fullDate}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      Inputs ({tx.inputs.length})
                    </div>
                    <div className="space-y-1">
                      {tx.inputs.slice(0, 2).map((input, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs"
                        >
                          {input.isCoinbase ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              Coinbase (Mining Reward)
                            </span>
                          ) : (
                            <>
                              {input.address && (
                                <CopyableAddress
                                  address={input.address}
                                  truncate
                                  className="font-mono"
                                />
                              )}
                              {input.value !== undefined && (
                                <span className="text-zinc-600 dark:text-zinc-400">
                                  {input.value.toFixed(8)} BTC
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                      {tx.inputs.length > 2 && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          +{tx.inputs.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      Outputs ({tx.outputs.length})
                    </div>
                    <div className="space-y-1">
                      {tx.outputs.slice(0, 2).map((output) => (
                        <div
                          key={output.n}
                          className="flex items-center gap-2 text-xs"
                        >
                          {output.address ? (
                            <CopyableAddress
                              address={output.address}
                              truncate
                              className="font-mono"
                            />
                          ) : (
                            <ScriptTypeLabel scriptType={output.scriptType} />
                          )}
                          <span className="text-zinc-600 dark:text-zinc-400">
                            {output.value.toFixed(8)} BTC
                          </span>
                        </div>
                      ))}
                      {tx.outputs.length > 2 && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          +{tx.outputs.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
