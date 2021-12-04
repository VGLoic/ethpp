import { MetaMaskConnector, ProviderConnectors } from "..";

const metamaskConnector = new MetaMaskConnector();

export const DEFAULT_CONNECTORS: ProviderConnectors = {
  MetaMask: metamaskConnector,
};
