import { Connector } from "./connectors";

export type EthProvider = {
  on: (eventName: string, callback: (param: any) => void) => void;
  removeListener: (eventName: string, callback: (param: any) => void) => void;
  request: (arg: { method: string; params?: unknown }) => Promise<unknown>;
  isMetaMask?: boolean;
};

export type ProviderConnectors = {
  [providerKey: string]: Connector;
};

export type ProviderKey = string;

export type SuccessfullConnection = {
  accounts: string[];
  chainId: string;
  selectedProvider: ProviderKey;
};
