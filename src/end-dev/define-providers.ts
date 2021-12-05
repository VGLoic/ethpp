import { ProviderConnectors } from "..";
import { DEFAULT_CONNECTORS } from "./default-connectors";

export function defineProviders<
  DefinedProviderConnectors extends ProviderConnectors
>(providerConnectors?: DefinedProviderConnectors) {
  if (!providerConnectors) return DEFAULT_CONNECTORS;
  Object.values(providerConnectors).reduce((acc, connector) => {
    if (acc[connector.id]) {
      throw new Error(
        "Invalid connector configuration. Would it be possible that two similar connectors have been registered?"
      );
    }
    return {
      ...acc,
      [connector.id]: true,
    };
  }, {} as Record<string, boolean>);
  return providerConnectors;
}
