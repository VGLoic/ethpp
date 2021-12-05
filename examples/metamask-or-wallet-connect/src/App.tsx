import * as React from "react";
import { useEthpp, useSelectedProvider } from "ethpp";

function NotConnectedApp() {
  const { connectProvider } = useEthpp();

  return (
    <div>
      <div>Connect with:</div>
      <button onClick={() => connectProvider("MetaMask")}>MetaMask</button>
      <button onClick={() => connectProvider("WalletConnect")}>
        Wallet Connect
      </button>
    </div>
  );
}

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

  if (globalStatus === "initializing") return null;

  if (globalStatus === "notConnected") return <NotConnectedApp />;

  return <ConnectedApp />;
}

export default App;
