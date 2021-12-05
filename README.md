# Ethereum Providers Platform

## Disclaimer

This package is strongly inspired from [web3-react](https://github.com/NoahZinsmeister/web3-react).

**❗❗ This is an alpha version ❗❗ Use it at your own risk ❗❗**

## Installation

The recommend way to use Ethpp with a React app is to install it as a dependency:

```console
# If you use npm:
npm install ethpp

# Or if you use Yarn:
yarn add ethpp
```

## Quick Start Example

Stronger and more complete examples are presented in the `examples` folder, in particular concerning handling multiple providers and type safe code. The following example should be considered as a quick start.

The first step is to define the various providers that will be available in the application and to initialize the Ethpp provider.

```typescript
// index.tsx
import {
    defineProviders,
    EthppProvider,
    MetaMaskConnector,
    WalletConnectConnector
} from "ethpp";

const providerConnectors = defineProviders({
  MetaMask: new MetaMaskConnector(),
  WalletConnect: new WalletConnectConnector({
    infuraId: "<MY_INFURA_ID>",
  }),
});
...

ReactDOM.render(
  <React.StrictMode>
    <EthppProvider providerConnectors={providerConnectors}>
      <App />
    </EthppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

In any React child of the provider, one can use the `useEthpp` and the `useProvider` hooks in order to access the state and the methods.

```typescript
// App.tsx
import { useProvider } from "ethpp";

type ExampleProviderStateProps = { providerKey: string };
function ExampleProviderState({ providerKey }: ExampleProviderStateProps) {
  const { status, account, chainId, connect, disconnect, provider } =
    useProvider(providerKey);

  if (status === "unavailable")
    return <div>Provider {providerKey} not available :(</div>;

  if (status === "notConnected")
    return <button onClick={connect}>Connect to {providerKey}</button>;

  if (status === "connected") {
    return (
      <div>
        <div>Connected account: {account}</div>
        <div>Chain ID: {chainId}</div>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return null;
}

function App() {
  const { globalStatus } = useEthpp();

  if (globalStatus === "initializing")
    return <div>Synchronisation with providers ongoing...</div>;

  return (
    <>
      <ExampleProviderState providerKey="MetaMask" />
      <ExampleProviderState providerKey="WalletConnect" />
    </>
  );
}
```
