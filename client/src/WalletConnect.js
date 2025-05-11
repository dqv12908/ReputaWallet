import React from 'react';
import { MeshProvider, CardanoWallet, useWallet } from '@meshsdk/react';

function WalletConnectContent() {
  const { connected, wallet } = useWallet();

  React.useEffect(() => {
    console.log('WalletConnect: connected =', connected);
    async function sendAddress() {
      if (connected && wallet) {
        try {
          const address = await wallet.getChangeAddress();
          console.log('WalletConnect: got address', address);
          localStorage.setItem('wallet_address', address);
          console.log('Wallet address written to localStorage:', address);
          window.close();
        } catch (error) {
          console.error('Error getting change address:', error);
        }
      }
    }
    sendAddress();
  }, [connected, wallet]);

  return <CardanoWallet label="Select Wallet" />;
}

export default function WalletConnect() {
  return (
    <MeshProvider>
      <WalletConnectContent />
    </MeshProvider>
  );
} 