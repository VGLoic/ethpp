import { act, renderHook } from "@testing-library/react-hooks";
import { setupEthTesting } from "eth-testing";

import { useProvider, EthppProvider } from "..";
import { LocalStorageHelper, LOCAL_STORAGE_KEY } from "../helpers";
import { MockLocalStorage } from "../testing-utils";

describe("Ethpp Provider - MetaMask", () => {
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

  describe("when MetaMask is not available", () => {
    test("when there is no `ethereum` object in the window, it should synchronise into `unavailable` status", async () => {
      const { result, waitForValueToChange } = renderHook(useProvider, {
        wrapper: EthppProvider,
        initialProps: "MetaMask",
      });

      expect(result.current.status).toEqual("initializing");

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status).toEqual("unavailable");
    });

    test("calling `connect` should throw", async () => {
      const errorLog = jest
        .spyOn(console, "error")
        .mockImplementationOnce(() => {})
        .mockImplementationOnce(() => {});
      const { result, waitForValueToChange } = renderHook(useProvider, {
        wrapper: EthppProvider,
        initialProps: "MetaMask",
      });

      await waitForValueToChange(() => result.current.status);

      await expect(result.current.connect).rejects.toEqual(
        new Error("Error while connecting :(")
      );

      expect(errorLog).toHaveBeenCalledTimes(2);
    });
  });

  describe("when MetaMask is available", () => {
    let originalEth: any;
    const { provider: ethereum, testingUtils } = setupEthTesting({
      providerType: "MetaMask",
    });

    beforeAll(() => {
      originalEth = (window as any).ethereum;
      (window as any).ethereum = ethereum;
    });

    afterAll(() => {
      (window as any).ethereum = originalEth;
    });

    afterEach(() => {
      testingUtils.clearAllMocks();
    });

    describe("when MetaMask is not connected", () => {
      beforeEach(() => {
        testingUtils.mockAccounts([]);
        testingUtils.mockChainId("0x1");
      });

      test("when MetaMask is unlocked but no account is connected, it should end up in the `notConnected` status", async () => {
        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: EthppProvider,
          initialProps: "MetaMask",
        });

        expect(result.current.status).toEqual("initializing");

        await waitForNextUpdate();

        expect(result.current.chainId).toEqual(null);
        expect(result.current.account).toEqual(null);
        expect(result.current.key).toEqual("MetaMask");
        expect(result.current.provider).toEqual(ethereum);
        expect(result.current.status).toEqual("notConnected");
      });

      test("calling `connect` method should end in a successful connection", async () => {
        testingUtils.lowLevel.mockRequest("eth_requestAccounts", [address]);

        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: EthppProvider,
          initialProps: "MetaMask",
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
        expect(LocalStorageHelper.getKeys()).toEqual(["MetaMask"]);
      });

      test("calling `connect` method should end in the `notConnected` status if the request fails", async () => {
        const errorLog = jest
          .spyOn(console, "error")
          .mockImplementationOnce(() => {})
          .mockImplementationOnce(() => {});
        const error = new Error("Test Error");
        testingUtils.lowLevel.mockRequest("eth_requestAccounts", error, {
          shouldThrow: true,
        });

        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: EthppProvider,
          initialProps: "MetaMask",
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
          wrapper: EthppProvider,
          initialProps: "MetaMask",
        });

        expect(result.current.status).toEqual("initializing");

        await waitForNextUpdate();

        await expect(result.current.disconnect).rejects.toEqual(
          new Error("Provider not connected!")
        );
      });
    });

    describe("when MetaMask is already connected", () => {
      beforeEach(() => {
        testingUtils.mockAccounts([address]);
        testingUtils.mockChainId("0x1");
        mockLocalStorage.setItem(LOCAL_STORAGE_KEY, '["MetaMask"]');
      });

      test("initialization should successfully connect to the account", async () => {
        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: EthppProvider,
          initialProps: "MetaMask",
        });

        expect(result.current.status).toEqual("initializing");

        await waitForNextUpdate();

        expect(result.current.status).toEqual("connected");
        expect(result.current.account).toEqual(address);
        expect(LocalStorageHelper.getKeys()).toEqual(["MetaMask"]);
      });

      test("when account changes, it should reflect on the state", async () => {
        const otherAddress = "0x19F7Fa0a30d5829acBD9B35bA2253a759a37EfC6";

        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: EthppProvider,
          initialProps: "MetaMask",
        });

        await waitForNextUpdate();

        expect(result.current.account).toEqual(address);

        act(() => {
          testingUtils.mockAccountsChanged([otherAddress]);
        });

        expect(result.current.status).toEqual("connected");
        expect(result.current.account).toEqual(otherAddress);
        expect(LocalStorageHelper.getKeys()).toEqual(["MetaMask"]);
      });

      test("when account changes with empty account, it should lead to `notConnected` status", async () => {
        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: EthppProvider,
          initialProps: "MetaMask",
        });

        await waitForNextUpdate();

        expect(result.current.account).toEqual(address);

        act(() => {
          testingUtils.mockAccountsChanged([]);
        });

        expect(result.current.status).toEqual("notConnected");
        expect(result.current.account).toEqual(null);
        expect(LocalStorageHelper.getKeys()).toEqual([]);
      });

      test("calling `disconnect` method should end in the `notConnected` status", async () => {
        const { result, waitForNextUpdate } = renderHook(useProvider, {
          wrapper: EthppProvider,
          initialProps: "MetaMask",
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
