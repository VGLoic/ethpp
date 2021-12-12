import WalletConnectProvider from "@walletconnect/web3-provider";
import { SuccessfullConnection } from "../common";
import { Connector } from "./connector";

export class WalletConnectConnector implements Connector {
  provider: WalletConnectProvider;
  id: string;

  constructor(opts: any) {
    this.provider = new WalletConnectProvider(opts);
    this.id = `wallet_connect_connector_${opts.infuraId}`;
  }

  getProvider() {
    return this.provider;
  }

  subscribeToAccountsChanged(cb: (accounts: string[]) => void): () => void {
    this.provider.on("accountsChanged", cb);
    return () => this.provider.removeListener("accountsChanged", cb);
  }

  subscribeToChainChanged(cb: (chaindId: string) => void): () => void {
    const callback = (chainId: number) => cb(this.formatChainId(chainId));
    this.provider.on("chainChanged", callback);
    return () => this.provider.removeListener("chainChanged", callback);
  }

  async synchronize(): Promise<SuccessfullConnection | null> {
    const rawWalletConnectItem = localStorage.getItem("walletconnect");
    if (rawWalletConnectItem) {
      try {
        const walletConnectItem = JSON.parse(rawWalletConnectItem);
        if (walletConnectItem.connected) {
          const accounts = await this.provider.enable();
          const chainId = (await this.provider.request({
            method: "eth_chainId",
          })) as string;

          return {
            accounts,
            chainId,
            selectedProvider: "WalletConnect",
          };
        }
      } catch (err) {
        localStorage.removeItem("walletconnect");
      }
    }
    return null;
  }

  async connect(): Promise<SuccessfullConnection> {
    try {
      const accounts = await this.provider.enable();
      const chainId = (await this.provider.request({
        method: "eth_chainId",
      })) as string;

      return {
        accounts,
        chainId,
        selectedProvider: "WalletConnect",
      };
    } catch (err) {
      localStorage.removeItem("walletconnect");
      throw new Error("Fail to connect!");
    }
  }

  async disconnect() {
    await this.provider.disconnect();
  }

  private formatChainId(chainId: number) {
    return `0x${Number(chainId).toString()}`;
  }
}
