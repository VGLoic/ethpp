import { ProviderConnectors, WalletConnectConnector } from "..";
import { DEFAULT_CONNECTORS } from "./default-connectors";

type DefineProviderOpts = {
  disableDefaults?: boolean;
};
export function defineProviders(
  providerConnectors: Record<string, WalletConnectConnector>,
  opts = {} as DefineProviderOpts
): ProviderConnectors {
  if (opts.disableDefaults) return providerConnectors;
  return {
    ...DEFAULT_CONNECTORS,
    ...providerConnectors,
  };
}
