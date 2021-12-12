import WalletConnectProvider from "@walletconnect/web3-provider";
import * as React from "react";
import { EthProvider, ProviderKey } from "../common";
import { ProviderState } from "../reducer";
import { useEthpp } from "./use-ethpp";

type UseProvider =
  | {
      status: "initializing";
      account: null;
      chainId: null;
      provider: EthProvider | WalletConnectProvider | null;
      key: ProviderKey;
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
    }
  | {
      status: "unavailable";
      account: null;
      chainId: null;
      provider: null;
      key: ProviderKey;
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
    }
  | {
      status: "notConnected";
      account: null;
      chainId: null;
      provider: EthProvider | WalletConnectProvider;
      key: ProviderKey;
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
    }
  | (ProviderState & {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      provider: EthProvider | WalletConnectProvider;
    });
export function useProvider(providerKey: ProviderKey): UseProvider {
  const {
    providers,
    connectProvider,
    disconnectProvider,
    providerConnectors,
    globalStatus,
  } = useEthpp();

  if (!(providerKey in providerConnectors)) {
    throw new Error("Connector not existing :(");
  }

  const connect = React.useCallback(
    () => connectProvider(providerKey),
    [providerKey, connectProvider]
  );
  const disconnect = React.useCallback(
    () => disconnectProvider(providerKey),
    [providerKey, disconnectProvider]
  );

  const providerState = providers[providerKey];

  const provider = React.useMemo(() => {
    const connector = providerConnectors[providerKey];
    if (!connector) return null;
    return connector.getProvider();
  }, [providerKey, providerConnectors]);

  if (globalStatus === "initializing") {
    return {
      status: "initializing",
      account: null,
      chainId: null,
      provider,
      key: providerKey,
      connect,
      disconnect,
    };
  }

  if (!providerState) {
    if (!provider) {
      return {
        status: "unavailable",
        account: null,
        chainId: null,
        provider,
        key: providerKey,
        connect,
        disconnect,
      };
    }

    return {
      status: "notConnected",
      account: null,
      chainId: null,
      provider,
      key: providerKey,
      connect,
      disconnect,
    };
  }

  return {
    ...providerState,
    connect,
    disconnect,
    provider: provider as EthProvider | WalletConnectProvider,
  };
}

export function useConnectedProvider(providerKey: ProviderKey) {
  const providerState = useProvider(providerKey);

  if (providerState.status !== "connected") {
    throw new Error(
      "`useConnectedProvider` can be used only once the provider has been connected."
    );
  }

  return {
    provider: providerState.provider as EthProvider | WalletConnectProvider,
    chainId: providerState.chainId,
    account: providerState.account,
    key: providerKey,
    disconnect: providerState.disconnect,
  };
}

export function useSelectedProvider() {
  const { selectedProvider } = useEthpp();
  if (!selectedProvider) {
    throw new Error(
      "`useSelectedProvider` can be used only once a provider has been selected"
    );
  }
  return useConnectedProvider(selectedProvider);
}
