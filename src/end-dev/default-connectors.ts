import { MetaMaskConnector } from "..";

const metamaskConnector = new MetaMaskConnector();

export const DEFAULT_CONNECTORS = {
  MetaMask: metamaskConnector,
};
