import { useQuery } from '@tanstack/react-query';
import { api, NetworkStats } from '../lib/api';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function DifficultyAdjustment() {
  const { data: stats, isLoading, error } = useQuery<NetworkStats>({
    queryKey: ['networkStats'],
    queryFn: () => api.getNetworkStats(),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="space-y-2">
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load network statistics</AlertDescription>
      </Alert>
    );
  }

  const { nextRetarget } = stats;
  const changeIcon =
    nextRetarget.estimatedChange > 1 ? (
      <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
    ) : nextRetarget.estimatedChange < -1 ? (
      <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
    ) : (
      <Minus className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
    );

  const changeColor =
    nextRetarget.estimatedChange > 1
      ? 'text-red-600 dark:text-red-400'
      : nextRetarget.estimatedChange < -1
        ? 'text-green-600 dark:text-green-400'
        : 'text-zinc-600 dark:text-zinc-400';

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-gray-700" />
          <h3 className="text-sm font-semibold">Difficulty Adjustment</h3>
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${changeColor}`}>
          {changeIcon}
          {nextRetarget.estimatedChange > 0 ? '+' : ''}
          {nextRetarget.estimatedChange.toFixed(1)}%
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-600">Progress to Retarget</span>
            <span className="text-xs font-medium">
              {nextRetarget.progressPercent.toFixed(1)}%
            </span>
          </div>
          <Progress value={nextRetarget.progressPercent} className="h-1.5" />
          <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
            <span>{nextRetarget.remainingBlocks} blocks</span>
            <span>#{nextRetarget.height}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
