import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock,
  Database,
  FileText,
  Hash,
  Layers,
} from 'lucide-react';

import { api } from '../lib/api';
import { formatTimeAgoWithTooltip } from '../lib/timeUtils';
import { CopyableAddress } from './CopyableAddress';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface BlockDetailsProps {
  blockHash: string;
  onBack: () => void;
}

export function BlockDetails({ blockHash, onBack }: BlockDetailsProps) {
  const {
    data: block,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['block', blockHash],
    queryFn: async () => {
      const blockData = await api.getBlock(blockHash);
      return blockData;
    },
    enabled: !!blockHash,
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
            <CardTitle>Block Details</CardTitle>
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

  if (error || !block) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Block Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600 p-4 border border-red-200 rounded-lg">
              Failed to fetch block details. Make sure the block hash or height
              is valid.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { timeAgo, fullDate } = formatTimeAgoWithTooltip(block.time);

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" size="sm">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Explorer
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Block Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Block Height
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                #{block.height.toLocaleString()}
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Block Hash
                </span>
              </div>
              <CopyableAddress
                address={block.hash}
                truncate={false}
                className="text-xs"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Time
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-sm text-gray-900 cursor-help">
                        {timeAgo}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{fullDate}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Transactions
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {block.transactions.length}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Size
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {(block.size / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>

            <Separator />

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-gray-900">
                Transactions in this Block
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {block.transactions.map((tx, idx) => (
                  <div
                    key={tx.txid}
                    onClick={() => (window.location.hash = `tx/${tx.txid}`)}
                    className="flex items-center justify-between p-3 border rounded hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <CopyableAddress
                        address={tx.txid}
                        truncate
                        className="text-xs text-gray-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
