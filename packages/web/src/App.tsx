import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Bitcoin, Blocks, Droplets, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AddressDetails } from './components/AddressDetails';
import { BlockchainStats } from './components/BlockchainStats';
import { BlockList } from './components/BlockList';
import { BlockDetails } from './components/BlockDetails';
import { Faucet } from './components/Faucet';
import { Search } from './components/Search';
import { TransactionDetails } from './components/TransactionDetails';
import { TransactionList } from './components/TransactionList';
import { MempoolView } from './components/MempoolView';
import { MempoolStats } from './components/MempoolStats';
import { FeeRecommendations } from './components/FeeRecommendations';
import { DifficultyAdjustment } from './components/DifficultyAdjustment';
import { TransactionBroadcast } from './components/TransactionBroadcast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type Route =
  | { type: 'explorer' }
  | { type: 'mempool' }
  | { type: 'faucet' }
  | { type: 'address'; address: string }
  | { type: 'transaction'; txid: string }
  | { type: 'block'; blockHash: string };

function App() {
  const [route, setRoute] = useState<Route>({ type: 'explorer' });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('address/')) {
        const address = hash.slice(8);
        setRoute({ type: 'address', address });
      } else if (hash.startsWith('tx/')) {
        const txid = hash.slice(3);
        setRoute({ type: 'transaction', txid });
      } else if (hash.startsWith('block/')) {
        const blockHash = hash.slice(6);
        setRoute({ type: 'block', blockHash });
      } else if (hash === 'mempool') {
        setRoute({ type: 'mempool' });
      } else if (hash === 'faucet') {
        setRoute({ type: 'faucet' });
      } else {
        setRoute({ type: 'explorer' });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToAddress = (address: string) => {
    window.location.hash = `address/${address}`;
  };

  const navigateToTransaction = (txid: string) => {
    window.location.hash = `tx/${txid}`;
  };

  const navigateToExplorer = () => {
    window.location.hash = '';
  };

  const handleSearch = (query: string, type: 'address' | 'transaction') => {
    if (type === 'address') {
      navigateToAddress(query);
    } else {
      navigateToTransaction(query);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-6">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={navigateToExplorer}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md group-hover:shadow-lg transition-shadow">
                  <Bitcoin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Bitcoin Regtest Explorer
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 max-w-2xl">
                <Search onSearch={handleSearch} />
                <TransactionBroadcast />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-700">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {route.type === 'address' ? (
            <AddressDetails
              address={route.address}
              onBack={navigateToExplorer}
            />
          ) : route.type === 'transaction' ? (
            <TransactionDetails
              txid={route.txid}
              onBack={navigateToExplorer}
            />
          ) : route.type === 'block' ? (
            <BlockDetails
              blockHash={route.blockHash}
              onBack={navigateToExplorer}
            />
          ) : (
            <Tabs
              value={route.type}
              onValueChange={(value) => {
                if (value === 'faucet') {
                  window.location.hash = 'faucet';
                } else if (value === 'mempool') {
                  window.location.hash = 'mempool';
                } else {
                  window.location.hash = '';
                }
              }}
              className="space-y-6"
            >
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
                <TabsTrigger value="explorer" className="gap-2">
                  <Blocks className="h-4 w-4" />
                  Explorer
                </TabsTrigger>
                <TabsTrigger value="mempool" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Mempool
                </TabsTrigger>
                <TabsTrigger value="faucet" className="gap-2">
                  <Droplets className="h-4 w-4" />
                  Faucet
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explorer" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <BlockchainStats />
                  </div>
                  <DifficultyAdjustment />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MempoolStats />
                  <FeeRecommendations />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BlockList />
                  <TransactionList />
                </div>
              </TabsContent>

              <TabsContent value="mempool" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MempoolStats />
                  <FeeRecommendations />
                </div>
                <MempoolView />
              </TabsContent>

              <TabsContent value="faucet">
                <div className="max-w-2xl mx-auto">
                  <Faucet />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>

        <footer className="mt-auto border-t bg-gray-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <p>Bitcoin Regtest Environment</p>
              <p>Network: Regtest | Auto-mining: 10s</p>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
