import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { cn } from '../lib/utils';
import { Button } from './ui/button';

interface CopyableAddressProps {
  address: string;
  className?: string;
  truncate?: boolean;
  showIcon?: boolean;
}

export function CopyableAddress({
  address,
  className,
  truncate = true,
  showIcon = true,
}: CopyableAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayAddress = truncate
    ? `${address.slice(0, 8)}...${address.slice(-8)}`
    : address;

  return (
    <div className={cn('flex items-center gap-1 group', className)}>
      <code className="text-xs font-mono text-muted-foreground">
        {displayAddress}
      </code>
      {showIcon && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}
