import * as React from "react";
import { useEthpp, useProvider, useSelectedProvider } from "ethpp";

type ProviderStateProps = {
  providerKey: string;
};
function ProviderState({ providerKey }: ProviderStateProps) {
  const { selectProvider } = useEthpp();
  const { status, connect, disconnect, account, chainId, provider, key } =
    useProvider(providerKey);

  const [balance, setBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchBalance() {
      if (status !== "connected" || !provider) {
        setBalance(null);
        return;
      }
      const balance = await provider.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      setBalance(Number(balance) / 10 ** 18);
    }
    fetchBalance();
  }, [provider, account, chainId, status]);

  if (status === "unavailable") {
    return (
      <div style={{ margin: "24px" }}>
        <div>
          <strong>Provider</strong> {key}
        </div>
        <div>Unavailable</div>
      </div>
    );
  }

  if (status === "notConnected") {
    return (
      <div style={{ margin: "24px" }}>
        <div>
          <strong>Provider</strong> {key}
        </div>
        <button onClick={connect}>Connect</button>
      </div>
    );
  }

  return (
    <div style={{ margin: "24px" }}>
      <div>
        <strong>Provider</strong> {key}
      </div>
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
      <button onClick={() => selectProvider(key)}>Select this provider</button>
    </div>
  );
}

function ConnectedApp() {
  const { account, chainId, disconnect, provider, key } = useSelectedProvider();

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
    <div style={{ margin: "24px" }}>
      <div>
        <strong>Selected provider: </strong> {key}
      </div>
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

  return (
    <div style={{ margin: "24px" }}>
      <div style={{ display: "flex" }}>
        <ProviderState providerKey="MetaMask" />
        <ProviderState providerKey="WalletConnect" />
      </div>
      {globalStatus === "connected" && <ConnectedApp />}
    </div>
  );
}

export default App;
