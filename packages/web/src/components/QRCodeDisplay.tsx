import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  size?: number;
}

export function QRCodeDisplay({ value, title = 'QR Code', size = 256 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }
    ).catch((err) => {
      setError(err.message);
    });
  }, [value, size]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <>
              <canvas ref={canvasRef} className="rounded-lg border" />
              <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center break-all max-w-full px-4">
                {value}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
