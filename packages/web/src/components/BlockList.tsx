import { useQuery } from '@tanstack/react-query';
import { Blocks, Clock, Database, Hash } from 'lucide-react';
import { useState } from 'react';

import { api, Block } from '../lib/api';
import { formatTimeAgoWithTooltip } from '../lib/timeUtils';
import { CopyableAddress } from './CopyableAddress';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

type SortOrder = 'newest' | 'oldest';

export function BlockList() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const { data: blocks, isLoading } = useQuery<Block[]>({
    queryKey: ['blocks', 'latest'],
    queryFn: () => api.getLatestBlocks(20),
    refetchInterval: 5000,
  });

  const sortedBlocks = blocks
    ? [...blocks].sort((a, b) =>
        sortOrder === 'newest' ? b.height - a.height : a.height - b.height
      )
    : [];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Blocks className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Block History</h2>
          {blocks && (
            <Badge variant="secondary" className="ml-2">
              {blocks.length}
            </Badge>
          )}
        </div>
        <Tabs
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as SortOrder)}
        >
          <TabsList>
            <TabsTrigger value="newest">Newest</TabsTrigger>
            <TabsTrigger value="oldest">Oldest</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        <TooltipProvider>
          {sortedBlocks.map((block) => {
            const { timeAgo, fullDate } = formatTimeAgoWithTooltip(block.time);
            return (
              <div
                key={block.hash}
                onClick={() => (window.location.hash = `block/${block.hash}`)}
                className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="font-bold text-gray-900">
                      #{block.height.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right space-y-1 flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900">
                      {block.txCount} tx{block.txCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(block.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <CopyableAddress
                    address={block.hash}
                    truncate
                    className="text-gray-600 text-xs"
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs">{timeAgo}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{fullDate}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </Card>
  );
}
