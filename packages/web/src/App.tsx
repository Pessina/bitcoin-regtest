import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Bitcoin } from 'lucide-react';

import { AddressSearch } from './components/AddressSearch';
import { BlockchainStats } from './components/BlockchainStats';
import { BlockList } from './components/BlockList';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <Bitcoin className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Bitcoin Regtest Explorer</h1>
                <p className="text-sm text-muted-foreground">
                  Local development blockchain explorer
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <BlockchainStats />

            <div className="grid gap-8 lg:grid-cols-2">
              <BlockList />
              <AddressSearch />
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
