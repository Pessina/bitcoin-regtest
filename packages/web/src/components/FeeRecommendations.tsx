import { useQuery } from '@tanstack/react-query';
import { Clock, DollarSign, TrendingUp, Zap } from 'lucide-react';

import { api, FeeRecommendation } from '../lib/api';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card } from './ui/card';

export function FeeRecommendations() {
  const {
    data: fees,
    isLoading,
    error,
  } = useQuery<FeeRecommendation>({
    queryKey: ['feeRecommendations'],
    queryFn: () => api.getFeeRecommendations(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !fees) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load fee recommendations</AlertDescription>
      </Alert>
    );
  }

  const feeOptions = [
    {
      priority: 'High Priority',
      icon: Zap,
      data: fees.high,
      description: 'Next block',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      priority: 'Medium Priority',
      icon: TrendingUp,
      data: fees.medium,
      description: 'Within 30 min',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      priority: 'Low Priority',
      icon: Clock,
      data: fees.low,
      description: 'Within 1 hour',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">
          Fee Recommendations
        </h3>
      </div>
      <div className="space-y-3">
        {feeOptions.map(
          ({
            priority,
            icon: Icon,
            data,
            description,
            color,
            bgColor,
            borderColor,
          }) => (
            <div
              key={priority}
              className={`flex items-center justify-between p-3 rounded-lg border ${bgColor} ${borderColor}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {priority}
                  </div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-base font-bold ${color}`}>
                  {data.satPerVByte} sat/vB
                </div>
                <div className="text-xs text-gray-500">{data.eta}</div>
              </div>
            </div>
          )
        )}
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Fee estimates are based on recent network activity and may vary.
      </div>
    </Card>
  );
}
