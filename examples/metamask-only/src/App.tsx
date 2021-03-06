import * as React from "react";
import { useProvider, useSelectedProvider, useEthpp } from "ethpp";

function ConnectedApp() {
  const { account, chainId, disconnect, provider } = useSelectedProvider();

  const [balance, setBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchBalance() {
      const balance = await provider.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      setBalance(Number(balance) / 10 ** 18);
    }
    fetchBalance();
  }, [provider, account, chainId]);

  return (
    <div>
      <div>
        <strong>Account: </strong> {account}
      </div>
      <div>
        <strong>Chain ID: </strong> {chainId}
      </div>
      <div>
        <strong>Balance: </strong> {balance !== null ? `${balance} ETH` : null}
      </div>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}

function App() {
  const { globalStatus } = useEthpp();
  const { status, connect } = useProvider("MetaMask");

  if (globalStatus === "initializing") return null;

  if (status === "unavailable") return <div>MetaMask not available</div>;

  if (status === "notConnected")
    return <button onClick={connect}>Connect with MetaMask</button>;

  return <ConnectedApp />;
}

export default App;
