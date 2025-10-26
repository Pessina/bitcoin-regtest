import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Bitcoin, Blocks, Droplets } from 'lucide-react';

import { AddressSearch } from './components/AddressSearch';
import { BlockchainStats } from './components/BlockchainStats';
import { BlockList } from './components/BlockList';
import { Faucet } from './components/Faucet';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Tabs defaultValue="explorer" className="space-y-6">
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

              <div className="grid gap-6 lg:grid-cols-2">
                <BlockList />
                <AddressSearch />
              </div>
            </TabsContent>

            <TabsContent value="faucet">
              <div className="max-w-2xl mx-auto">
                <Faucet />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
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
