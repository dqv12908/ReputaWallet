import React from 'react';
import { MeshProvider, CardanoWallet, useWallet } from '@meshsdk/react';

export default function WalletConnect() {
  const { connected, getChangeAddress } = useWallet();

  React.useEffect(() => {
    console.log('WalletConnect: connected =', connected);
    async function sendAddress() {
      if (connected) {
        const address = await getChangeAddress();
        console.log('WalletConnect: got address', address);
        if (window.opener) {
          window.opener.postMessage({ type: 'CARDANO_WALLET_ADDRESS', address }, '*');
          window.close();
        }
      }
    }
    sendAddress();
  }, [connected, getChangeAddress]);

  return (
    <MeshProvider>
      <CardanoWallet label="Select Wallet" />
    </MeshProvider>
  );
} 