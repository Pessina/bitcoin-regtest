import { useQuery } from '@tanstack/react-query';
import { Blocks, HardDrive, Link } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import { api } from '../lib/api';
import { CopyableAddress } from './CopyableAddress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function BlockchainStats() {
  const { data: info, isLoading } = useQuery({
    queryKey: ['blockchain', 'info'],
    queryFn: () => api.getBlockchainInfo(),
    refetchInterval: 5000,
  });

  if (isLoading || !info) {
    return null;
  }

  const blocks = Number(info.blocks);
  const difficulty = Number(info.difficulty);
  const mediantime = Number(info.mediantime);
  const sizeOnDisk = Number(info.size_on_disk);

  const navigateToBestBlock = () => {
    window.location.hash = `block/${info.bestblockhash}`;
  };

  const clickableProps = {
    role: 'button' as const,
    tabIndex: 0,
    onClick: navigateToBestBlock,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigateToBestBlock();
      }
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card
        {...clickableProps}
        className="transition-colors hover:border-blue-300 hover:bg-blue-50/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chain Height</CardTitle>
          <Blocks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{blocks.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Network: {info.chain}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Difficulty</CardTitle>
          <Link className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {difficulty.toExponential(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Median time: {new Date(mediantime * 1000).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
      <Card
        {...clickableProps}
        className="transition-colors hover:border-blue-300 hover:bg-blue-50/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chain Size</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(sizeOnDisk / 1024 / 1024).toFixed(2)} MB
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <span className="mr-2">Best block:</span>
            <CopyableAddress
              address={info.bestblockhash}
              className="inline-flex items-center gap-1"
              truncate
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
