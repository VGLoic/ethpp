import * as React from 'react';
import { useProvider, useSelectedProvider } from "ethpp";

function ConnectedApp() {
  const { account, chainId, disconnect, provider } = useSelectedProvider();

  React.useEffect(() => {
    async function fetchBalance() {
      const balance = await provider.request({ method: "eth_getBalance", params: [account]})
      console.log('balance: ', balance);
    }
    fetchBalance();
  }, [provider, account]);

  return (
    <div>
      <div>
        <strong>Account: </strong> {account}
      </div>
      <div>
        <strong>Chain ID: </strong> {chainId}
      </div>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}

function App() {
  const { status, connect } = useProvider("MetaMask");

  if (status === "unavailable") return <div>MetaMask not available</div>;

  if (status === "notConnected")
    return <button onClick={connect}>Connect with MetaMask</button>;

  return <ConnectedApp />;
}

export default App;
