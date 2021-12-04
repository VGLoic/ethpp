import * as React from "react";
import { ProviderKey, ProviderConnectors } from "./common";
import { State, initialState, reducer } from "./reducer";
import {
  connectWallet,
  disconnectWallet,
  subscribeToAccountAndChainChanged,
  synchronize,
} from "./helpers";

export type IEthppContext = State & {
  connectProvider: (providerKey: ProviderKey) => Promise<void>;
  disconnectProvider: (providerKey: ProviderKey) => Promise<void>;
  selectProvider: (providerKey: ProviderKey) => void;
  connectors: ProviderConnectors;
  globalStatus: "initializing" | "notConnected" | "connected";
};

export const EthppContext = React.createContext<IEthppContext | undefined>(
  undefined
);

type EthppProps = {
  connectors: ProviderConnectors;
};

export function EthppProvider<Props extends EthppProps>({
  connectors,
  ...otherProps
}: Props) {
  const connectorsRef = React.useRef(connectors);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [isReady, setIsReady] = React.useState(false);

  const { selectedProvider, connectedKeys } = state;

  React.useEffect(() => {
    function subscribe() {
      return subscribeToAccountAndChainChanged({
        dispatch,
        connectors: connectorsRef.current,
        connectedKeys,
      });
    }

    const unsubscribe = subscribe();

    return unsubscribe;
  }, [connectedKeys]);

  const disconnectProvider = React.useCallback(
    async (providerKey: ProviderKey) => {
      if (!(providerKey in connectorsRef.current)) {
        throw new Error("Connector not existing :(");
      }
      if (!connectedKeys.includes(providerKey)) {
        throw new Error("Provider not connected!");
      }
      await disconnectWallet({
        dispatch,
        connectors: connectorsRef.current,
        providerKey,
      });
    },
    [connectedKeys]
  );

  const connectProvider = React.useCallback(
    async (providerKey: ProviderKey) => {
      if (!(providerKey in connectorsRef.current)) {
        throw new Error("Connector not existing :(");
      }
      try {
        await connectWallet({
          dispatch,
          connectors: connectorsRef.current,
          providerKey,
        });
      } catch (err) {
        console.error(err);
        throw new Error("Error while connecting :(");
      }
    },
    []
  );

  const selectProvider = React.useCallback((providerKey: ProviderKey) => {
    if (!(providerKey in connectorsRef.current)) {
      throw new Error("Connector not existing :(");
    }
    dispatch({ type: "selectedProviderChanged", payload: { providerKey } });
  }, []);

  React.useEffect(() => {
    synchronize({ dispatch, connectors: connectorsRef.current }).finally(() =>
      setIsReady(true)
    );
  }, []);

  const value: IEthppContext = {
    ...state,
    connectors: connectorsRef.current,
    connectProvider,
    disconnectProvider,
    selectProvider,
    globalStatus: !isReady
      ? "initializing"
      : !selectedProvider
      ? "notConnected"
      : "connected",
  };

  return <EthppContext.Provider value={value} {...otherProps} />;
}
