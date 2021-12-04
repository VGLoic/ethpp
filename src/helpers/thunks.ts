import { ProviderKey, ProviderConnectors } from "../common";
import { LocalStorageHelper } from "./local-storage";
import { Action } from "../reducer";

type SubscribeArgs = {
  dispatch: (action: Action) => void;
  connectors: ProviderConnectors;
  connectedKeys: ProviderKey[];
};
export function subscribeToAccountAndChainChanged({
  dispatch,
  connectors,
  connectedKeys,
}: SubscribeArgs) {
  const unsubscribes = connectedKeys.map((providerKey) => {
    const connector = connectors[providerKey];
    if (!connector) {
      throw new Error(
        "Connector not found while subscribing! Please file an issue"
      );
    }
    const onAccountsChanged = (accounts: string[]) => {
      dispatch({
        type: "accountChanged",
        payload: { accounts, providerKey },
      });
    };
    const onChainChanged = (chainId: string) => {
      dispatch({
        type: "chainChanged",
        payload: { chainId, providerKey },
      });
    };
    const accountsChangedUnsubcribe =
      connector.subscribeToAccountsChanged(onAccountsChanged);
    const chainChangedUnsubscribe =
      connector.subscribeToChainChanged(onChainChanged);
    return () => {
      accountsChangedUnsubcribe();
      chainChangedUnsubscribe();
    };
  });

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}

type DisconnectWalletArgs = {
  dispatch: (action: Action) => void;
  connectors: ProviderConnectors;
  providerKey: ProviderKey;
};
export async function disconnectWallet({
  dispatch,
  connectors,
  providerKey,
}: DisconnectWalletArgs) {
  const connector = connectors[providerKey];
  if (!connector) {
    throw new Error(
      "Connector not found while disconnecting! Please file an issue"
    );
  }
  await connector.disconnect();
  LocalStorageHelper.removeKey(providerKey);
  dispatch({ type: "disconnected", payload: { providerKey } });
}

type ConnectWalletArgs = {
  dispatch: (action: Action) => void;
  connectors: ProviderConnectors;
  providerKey: ProviderKey;
};
export async function connectWallet({
  dispatch,
  connectors,
  providerKey,
}: ConnectWalletArgs) {
  const connector = connectors[providerKey];
  if (!connector) {
    throw new Error(
      "Connector not found while connecting! Please file an issue"
    );
  }

  const { accounts, chainId } = await connector.connect();

  LocalStorageHelper.addKey(providerKey);
  dispatch({
    type: "connected",
    payload: {
      accounts,
      chainId,
      providerKey,
    },
  });
}

type SynchronizeArgs = {
  dispatch: (action: Action) => void;
  connectors: ProviderConnectors;
};
export async function synchronize({ dispatch, connectors }: SynchronizeArgs) {
  const rawProviderKeys = LocalStorageHelper.getKeys();
  const providerKeys: ProviderKey[] = [];
  rawProviderKeys.forEach((rawProviderKey) => {
    if (!(rawProviderKey in connectors)) {
      LocalStorageHelper.removeKey(rawProviderKey);
      return;
    }
    providerKeys.push(rawProviderKey as ProviderKey);
  });
  providerKeys.forEach(async (providerKey) => {
    if (!(providerKey in connectors)) {
      LocalStorageHelper.removeKey(providerKey);
      return;
    }
    const connector = connectors[providerKey];
    try {
      const successfullConnection = await connector.synchronize();
      if (!successfullConnection) {
        LocalStorageHelper.removeKey(providerKey);
        return;
      }
      dispatch({
        type: "connected",
        payload: {
          accounts: successfullConnection.accounts,
          chainId: successfullConnection.chainId,
          providerKey,
        },
      });
    } catch (err) {
      LocalStorageHelper.removeKey(providerKey);
      console.warn(`Unable to synchronize ${providerKey}. Got error: ${err}`);
    }
  });
}
