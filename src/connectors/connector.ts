import WalletConnectProvider from "@walletconnect/web3-provider";
import { EthProvider, SuccessfullConnection } from "../common";

export abstract class Connector {
  abstract id: string;
  abstract getProvider(): EthProvider | WalletConnectProvider | null;
  abstract subscribeToAccountsChanged(
    cb: (accounts: string[]) => void
  ): () => void;
  abstract subscribeToChainChanged(cb: (chainId: string) => void): () => void;
  abstract synchronize(): Promise<SuccessfullConnection | null>;
  abstract connect(): Promise<SuccessfullConnection>;
  abstract disconnect(): Promise<void>;
}
