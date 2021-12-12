import * as React from "react";
import { act, renderHook } from "@testing-library/react-hooks";
import { setupEthTesting } from "eth-testing";

import {
  useProvider,
  EthppProvider,
  defineProviders,
  WalletConnectConnector,
} from "..";
import { LocalStorageHelper, LOCAL_STORAGE_KEY } from "../helpers";
import { MockLocalStorage } from "../testing-utils";
import WalletConnectProvider from "@walletconnect/web3-provider";

describe("Ethpp Provider - WalletConnect", () => {
  const address = "0x19F7Fa0a30d5829acBD9B35bA2253a759a37EfC5";

  let localStorage: any;
  const mockLocalStorage = new MockLocalStorage();

  beforeAll(() => {
    localStorage = global.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
    });
  });

  afterEach(() => {
    mockLocalStorage.reset();
  });

  afterAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorage,
    });
  });

  describe("when WalletConnect is not available", () => {
    test("when there is no `WalletConnect` object in the connectors, `useProvider('WalletConnect')` should throw", async () => {
      function useTest() {
        try {
          useProvider("WalletConnect");
          return false;
        } catch (err) {
          return err;
        }
      }
      const { result, waitForNextUpdate } = renderHook(useTest, {
        wrapper: EthppProvider,
      });
      await waitForNextUpdate();
      expect(result.current).toEqual(new Error("Connector not existing :("));
    });
  });

  describe("when Wallet Connect is available", () => {
    const { provider: walletConnectProvider, testingUtils } = setupEthTesting({
      providerType: "WalletConnect",
    });

    const walletConnectConnector = new WalletConnectConnector({
      infuraId: "test_infura_id",
    });
    walletConnectConnector.provider =
      walletConnectProvider as unknown as WalletConnectProvider;

    const providerConnectors = defineProviders({
      WalletConnect: walletConnectConnector,
    });

    function TestProvider(props: any) {
      return (
        <EthppProvider providerConnectors={providerConnectors} {...props} />
      );
    }

    afterEach(() => {
      mockLocalStorage.reset();
      testingUtils.clearAllMocks();
    });

    describe("when WalletConnect is not connected", () => {
      beforeEach(() => {
        testingUtils.mockChainId("0x1");
      });

      test("it should end up in the `notConnected` status", async () => {
        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: TestProvider,
          initialProps: "WalletConnect",
        });

        expect(result.current.status).toEqual("initializing");

        await waitForNextUpdate();

        expect(result.current.chainId).toEqual(null);
        expect(result.current.account).toEqual(null);
        expect(result.current.key).toEqual("WalletConnect");
        expect(result.current.provider).toEqual(walletConnectProvider);
        expect(result.current.status).toEqual("notConnected");
      });

      test("calling `connect` method should end in a successful connection", async () => {
        testingUtils.mockAccounts([address]);

        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: TestProvider,
          initialProps: "WalletConnect",
        });

        expect(result.current.status).toEqual("initializing");

        await waitForNextUpdate();

        expect(result.current.status).toEqual("notConnected");

        act(() => {
          result.current.connect();
        });

        expect(result.current.status).toEqual("connecting");

        await waitForNextUpdate();

        expect(result.current.status).toEqual("connected");
        expect(result.current.account).toEqual(address);
        expect(result.current.chainId).toEqual("0x1");
        expect(LocalStorageHelper.getKeys()).toEqual(["WalletConnect"]);
      });

      test("calling `connect` method should end in the `notConnected` status if the request fails", async () => {
        const errorLog = jest
          .spyOn(console, "error")
          .mockImplementationOnce(() => {})
          .mockImplementationOnce(() => {});
        const error = new Error("Test Error");
        testingUtils.lowLevel.mockRequest("eth_accounts", error, {
          shouldThrow: true,
        });

        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: TestProvider,
          initialProps: "WalletConnect",
        });

        expect(result.current.status).toEqual("initializing");

        await waitForNextUpdate();

        expect(result.current.status).toEqual("notConnected");

        await expect(result.current.connect).rejects.toEqual(
          new Error("Error while connecting :(")
        );

        expect(errorLog).toHaveBeenCalledTimes(2);
      });

      test("calling `disconnect` method should throw if the provider is not connected", async () => {
        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: TestProvider,
          initialProps: "WalletConnect",
        });

        expect(result.current.status).toEqual("initializing");

        await waitForNextUpdate();

        await expect(result.current.disconnect).rejects.toEqual(
          new Error("Provider not connected!")
        );
      });
    });

    describe("when WalletConnect is already connected", () => {
      beforeEach(() => {
        testingUtils.mockAccounts([address]);
        testingUtils.mockChainId("0x1");
        mockLocalStorage.setItem(LOCAL_STORAGE_KEY, '["WalletConnect"]');
        mockLocalStorage.setItem(
          "walletconnect",
          JSON.stringify({ connected: true })
        );
      });

      test("initialization should successfully connect to the account", async () => {
        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: TestProvider,
          initialProps: "WalletConnect",
        });

        expect(result.current.status).toEqual("initializing");

        await waitForNextUpdate();

        expect(result.current.status).toEqual("connected");
        expect(result.current.account).toEqual(address);
        expect(LocalStorageHelper.getKeys()).toEqual(["WalletConnect"]);
      });

      test("when account changes, it should reflect on the state", async () => {
        const otherAddress = "0x19F7Fa0a30d5829acBD9B35bA2253a759a37EfC6";

        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: TestProvider,
          initialProps: "WalletConnect",
        });

        await waitForNextUpdate();

        expect(result.current.account).toEqual(address);

        act(() => {
          testingUtils.mockAccountsChanged([otherAddress]);
        });

        expect(result.current.status).toEqual("connected");
        expect(result.current.account).toEqual(otherAddress);
        expect(LocalStorageHelper.getKeys()).toEqual(["WalletConnect"]);
      });

      test("calling `disconnect` method should end in the `notConnected` status", async () => {
        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: TestProvider,
          initialProps: "WalletConnect",
        });

        expect(result.current.status).toEqual("initializing");

        await waitForNextUpdate();

        act(() => {
          result.current.disconnect();
        });

        await waitForNextUpdate();
        expect(result.current.status).toEqual("notConnected");
        expect(result.current.account).toEqual(null);
        expect(result.current.chainId).toEqual(null);
        expect(LocalStorageHelper.getKeys()).toEqual([]);
      });
    });
  });
});
