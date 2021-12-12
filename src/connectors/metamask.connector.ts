import { EthProvider, SuccessfullConnection } from "../common";
import { Connector } from "./connector";

export class MetaMaskConnector implements Connector {
  id = "metamask_connector";

  getProvider() {
    if (!window) return null;
    const metaMaskProvider = (window as any).ethereum as EthProvider;
    if (!metaMaskProvider || !metaMaskProvider.isMetaMask) {
      return null;
    }
    return metaMaskProvider;
  }

  subscribeToAccountsChanged(cb: (accounts: string[]) => void): () => void {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error("MetaMask unavailable");
    }
    provider.on("accountsChanged", cb);
    return () => provider.removeListener("accountsChanged", cb);
  }

  subscribeToChainChanged(cb: (chaindId: string) => void): () => void {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error("MetaMask unavailable");
    }
    provider.on("chainChanged", cb);
    return () => provider.removeListener("chainChanged", cb);
  }

  async synchronize(): Promise<SuccessfullConnection | null> {
    const provider = this.getProvider();
    if (!provider) {
      return null;
    }
    const chainId = (await provider.request({
      method: "eth_chainId",
    })) as string;

    const accessibleAccounts = (await provider.request({
      method: "eth_accounts",
    })) as string[];

    if (accessibleAccounts.length === 0) {
      return null;
    }

    return {
      accounts: accessibleAccounts,
      chainId,
      selectedProvider: "MetaMask",
    };
  }

  async connect(): Promise<SuccessfullConnection> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error("MetaMask unavailable");
    }
    try {
      const chainId = (await provider.request({
        method: "eth_chainId",
      })) as string;

      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      return { accounts, chainId, selectedProvider: "MetaMask" };
    } catch (err) {
      throw new Error("Fail to connect!");
    }
  }

  async disconnect() {}
}
