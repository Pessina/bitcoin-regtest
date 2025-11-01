import { RefreshCw, Zap } from 'lucide-react';

import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface TransactionBadgesProps {
  isRBF?: boolean;
  isSegWit?: boolean;
  className?: string;
}

export function TransactionBadges({
  isRBF,
  isSegWit,
  className,
}: TransactionBadgesProps) {
  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className || ''}`}>
        {isSegWit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                SegWit
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Segregated Witness transaction - lower fees and improved
                scalability
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        {isRBF && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="gap-1 border-amber-500 text-amber-700 dark:text-amber-400"
              >
                <RefreshCw className="h-3 w-3" />
                RBF
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Replace-By-Fee enabled - fee can be increased if unconfirmed
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
