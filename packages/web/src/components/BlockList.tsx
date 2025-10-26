import { useQuery } from '@tanstack/react-query';
import { Clock, Database, Hash } from 'lucide-react';

import { api, type Block } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function BlockList() {
  const {
    data: blocks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['blocks', 'latest'],
    queryFn: () => api.getLatestBlocks(10),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Blocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Blocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Failed to load blocks</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Blocks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {blocks?.map((block: Block) => {
            const height = Number(block.height);
            const time = Number(block.time);
            const txCount = Number(block.txCount);
            const size = Number(block.size);
            const difficulty = Number(block.difficulty);

            return (
              <div
                key={block.hash}
                className="border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Block #{height}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(time * 1000).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {block.hash.slice(0, 16)}...{block.hash.slice(-16)}
                  </code>
                </div>
                <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                  <span>{txCount} transactions</span>
                  <span>{(size / 1024).toFixed(2)} KB</span>
                  <span>Difficulty: {difficulty.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
