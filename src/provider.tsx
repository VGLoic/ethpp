import * as React from "react";
import { ProviderKey, ProviderConnectors } from "./common";
import { State, initialState, reducer } from "./reducer";
import {
  connectWallet,
  disconnectWallet,
  subscribeToAccountAndChainChanged,
  synchronize,
} from "./helpers";
import { DEFAULT_CONNECTORS } from ".";
import { useSafeDispatch } from "./helpers/use-safe-dispatch";

export type IEthppContext = State & {
  connectProvider: (providerKey: ProviderKey) => Promise<void>;
  disconnectProvider: (providerKey: ProviderKey) => Promise<void>;
  selectProvider: (providerKey: ProviderKey) => void;
  providerConnectors: ProviderConnectors;
  globalStatus: "initializing" | "notConnected" | "connected";
};

export const EthppContext = React.createContext<IEthppContext | undefined>(
  undefined
);

type EthppProps = React.PropsWithChildren<{
  providerConnectors?: ProviderConnectors;
}>;

export function EthppProvider({
  providerConnectors = DEFAULT_CONNECTORS,
  ...otherProps
}: EthppProps) {
  const providerConnectorsRef = React.useRef(providerConnectors);

  const [state, unsafeDispatch] = React.useReducer(reducer, initialState);
  const dispatch = useSafeDispatch(unsafeDispatch);

  const [isReady, setIsReady] = React.useState(false);

  const { selectedProvider, connectedKeys } = state;

  React.useEffect(() => {
    function subscribe() {
      return subscribeToAccountAndChainChanged({
        dispatch,
        providerConnectors: providerConnectorsRef.current,
        connectedKeys,
      });
    }

    const unsubscribe = subscribe();

    return unsubscribe;
  }, [connectedKeys, dispatch]);

  const disconnectProvider = React.useCallback(
    async (providerKey: ProviderKey) => {
      if (!(providerKey in providerConnectorsRef.current)) {
        throw new Error("Connector not existing :(");
      }
      if (!connectedKeys.includes(providerKey)) {
        throw new Error("Provider not connected!");
      }
      await disconnectWallet({
        dispatch,
        providerConnectors: providerConnectorsRef.current,
        providerKey,
      });
    },
    [connectedKeys, dispatch]
  );

  const connectProvider = React.useCallback(
    async (providerKey: ProviderKey) => {
      if (!(providerKey in providerConnectorsRef.current)) {
        throw new Error("Connector not existing :(");
      }
      try {
        await connectWallet({
          dispatch,
          providerConnectors: providerConnectorsRef.current,
          providerKey,
        });
      } catch (err) {
        console.error(err);
        throw new Error("Error while connecting :(");
      }
    },
    [dispatch]
  );

  const selectProvider = React.useCallback(
    (providerKey: ProviderKey) => {
      if (!(providerKey in providerConnectorsRef.current)) {
        throw new Error("Connector not existing :(");
      }
      dispatch({ type: "selectedProviderChanged", payload: { providerKey } });
    },
    [dispatch]
  );

  React.useEffect(() => {
    synchronize({
      dispatch,
      providerConnectors: providerConnectorsRef.current,
    }).finally(() => setIsReady(true));
  }, [dispatch]);

  const value: IEthppContext = {
    ...state,
    providerConnectors: providerConnectorsRef.current,
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
