import { useState, useEffect } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi'
import { config, GM_CONTRACT_ADDRESS, GM_ABI, arcTestnet } from '../lib/config'

// Shorten an address like 0x1234...5678
function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function GMApp() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])
  const [gmSent, setGmSent] = useState(false)

  // Read total GMs from contract
  const { data: totalGMs, refetch: refetchTotal } = useReadContract({
    address: GM_CONTRACT_ADDRESS as `0x${string}`,
    abi: GM_ABI,
    functionName: 'totalGMs',
  })

  // Read this user's GM count
  const { data: myGMCount, refetch: refetchMine } = useReadContract({
    address: GM_CONTRACT_ADDRESS as `0x${string}`,
    abi: GM_ABI,
    functionName: 'gmCount',
    args: address ? [address] : undefined,
  })

  // Read last GM sender
  const { data: lastSender } = useReadContract({
    address: GM_CONTRACT_ADDRESS as `0x${string}`,
    abi: GM_ABI,
    functionName: 'lastGMSender',
  })

  // Write: say GM
  const { data: txHash, writeContract, isPending } = useWriteContract()

  // Wait for tx confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Refetch after success
  useEffect(() => {
    if (isSuccess) {
      refetchTotal()
      refetchMine()
      setGmSent(true)
      // Trigger particle burst
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
      setParticles(newParticles)
      setTimeout(() => {
        setParticles([])
        setGmSent(false)
      }, 2000)
    }
  }, [isSuccess])

  const isWrongChain = isConnected && chainId !== arcTestnet.id
  const isContractUnset = GM_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'

  function handleSayGM() {
    writeContract({
      address: GM_CONTRACT_ADDRESS as `0x${string}`,
      abi: GM_ABI,
      functionName: 'sayGM',
    })
  }

  const buttonLabel = isPending
    ? 'Confirm in wallet...'
    : isConfirming
    ? 'Confirming...'
    : 'Say GM ☀️'

  return (
    <div className="app">
      {/* Particle burst on success */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        />
      ))}

      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">☀️</span>
          <span className="logo-text">GM on Arc</span>
        </div>
        {isConnected ? (
          <div className="wallet-info">
            <span className="chain-badge">Arc Testnet</span>
            <span className="address">{shortAddr(address!)}</span>
            <button className="btn-sm" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        ) : null}
      </header>

      {/* Main card */}
      <main className="main">
        <div className="card">
          <div className="sun-glow" />

          <h1 className="title">Good Morning, World</h1>
          <p className="subtitle">
            Say GM forever on the Arc blockchain — powered by USDC gas.
          </p>

          {/* Stats row */}
          <div className="stats">
            <div className="stat">
              <span className="stat-value">{totalGMs?.toString() ?? '—'}</span>
              <span className="stat-label">Total GMs</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">{myGMCount?.toString() ?? '—'}</span>
              <span className="stat-label">Your GMs</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">
                {lastSender && lastSender !== '0x0000000000000000000000000000000000000000'
                  ? shortAddr(lastSender)
                  : '—'}
              </span>
              <span className="stat-label">Last GM by</span>
            </div>
          </div>

          {/* Action area */}
          {isContractUnset ? (
            <div className="notice">
              ⚠️ Deploy the contract first, then paste the address into{' '}
              <code>src/lib/config.ts</code>
            </div>
          ) : !isConnected ? (
            <div className="connect-area">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  className="btn-primary"
                  onClick={() => connect({ connector })}
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          ) : isWrongChain ? (
            <button
              className="btn-warning"
              onClick={() => switchChain({ chainId: arcTestnet.id })}
            >
              Switch to Arc Testnet
            </button>
          ) : (
            <button
              className={`btn-gm ${gmSent ? 'success' : ''}`}
              onClick={handleSayGM}
              disabled={isPending || isConfirming}
            >
              {gmSent ? '✅ GM Sent!' : buttonLabel}
            </button>
          )}

          {txHash && (
            <a
              className="tx-link"
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on ArcScan ↗
            </a>
          )}
        </div>

        {/* How it works */}
        <div className="how-it-works">
          <h2>How it works</h2>
          <ol>
            <li>
              <strong>Connect</strong> your MetaMask wallet
            </li>
            <li>
              <strong>Switch</strong> to Arc Testnet (Chain ID: 5042002)
            </li>
            <li>
              <strong>Get USDC</strong> from{' '}
              <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer">
                faucet.circle.com
              </a>{' '}
              (for gas)
            </li>
            <li>
              <strong>Click "Say GM"</strong> — your greeting is on-chain forever!
            </li>
          </ol>
        </div>
      </main>

      <footer className="footer">
        Built on{' '}
        <a href="https://arc.network" target="_blank" rel="noopener noreferrer">
          Arc Network
        </a>{' '}
        · USDC-powered gas · EVM compatible
      </footer>
    </div>
  )
}
