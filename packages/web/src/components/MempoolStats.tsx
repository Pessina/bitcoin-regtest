import { useQuery } from '@tanstack/react-query';
import { Activity, Coins, Database, FileText } from 'lucide-react';

import { api, MempoolInfo } from '../lib/api';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card } from './ui/card';

export function MempoolStats() {
  const {
    data: mempoolInfo,
    isLoading,
    error,
  } = useQuery<MempoolInfo>({
    queryKey: ['mempoolInfo'],
    queryFn: () => api.getMempoolInfo(),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !mempoolInfo) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load mempool information</AlertDescription>
      </Alert>
    );
  }

  const stats = [
    {
      label: 'Transactions',
      value: mempoolInfo.size.toLocaleString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Size',
      value: `${(mempoolInfo.bytes / 1024 / 1024).toFixed(2)} MB`,
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Fees',
      value: `${mempoolInfo.total_fee.toFixed(8)} BTC`,
      icon: Coins,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Min Relay Fee',
      value: `${(mempoolInfo.minrelaytxfee * 100000000).toFixed(0)} sat/kB`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">
          Mempool Statistics
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bgColor }) => (
          <div
            key={label}
            className={`flex flex-col p-3 ${bgColor} rounded-lg border border-gray-200`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
            <div className="text-base font-bold text-gray-900">{value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
