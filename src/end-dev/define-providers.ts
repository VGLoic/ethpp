import { ProviderConnectors } from "..";

export function defineProviders<
  DefinedProviderConnectors extends ProviderConnectors
>(providerConnectors: DefinedProviderConnectors) {
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
