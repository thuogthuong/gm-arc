import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './lib/config'
import { GMApp } from './components/GMApp'
import './index.css'

const queryClient = new QueryClient()

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <GMApp />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
