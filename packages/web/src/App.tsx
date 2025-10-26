import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Bitcoin, Blocks, Droplets } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AddressDetails } from './components/AddressDetails';
import { BlockchainStats } from './components/BlockchainStats';
import { Faucet } from './components/Faucet';
import { Search } from './components/Search';
import { TransactionDetails } from './components/TransactionDetails';
import { TransactionList } from './components/TransactionList';
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
  | { type: 'faucet' }
  | { type: 'address'; address: string }
  | { type: 'transaction'; txid: string };

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div
                className="flex items-center gap-3 cursor-pointer shrink-0"
                onClick={navigateToExplorer}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Bitcoin className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Bitcoin Regtest
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Local Development Explorer
                  </p>
                </div>
              </div>
              <Search onSearch={handleSearch} />
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 shrink-0">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">
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
          ) : (
            <Tabs
              value={route.type}
              onValueChange={(value) => {
                if (value === 'faucet') {
                  window.location.hash = 'faucet';
                } else {
                  window.location.hash = '';
                }
              }}
              className="space-y-6"
            >
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="explorer" className="gap-2">
                  <Blocks className="h-4 w-4" />
                  Explorer
                </TabsTrigger>
                <TabsTrigger value="faucet" className="gap-2">
                  <Droplets className="h-4 w-4" />
                  Faucet
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explorer" className="space-y-6">
                <BlockchainStats />
                <TransactionList />
              </TabsContent>

              <TabsContent value="faucet">
                <div className="max-w-2xl mx-auto">
                  <Faucet />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>

        <footer className="mt-auto border-t bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
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
