import { ProviderKey } from "./common";
import { LocalStorageHelper } from "./helpers";

export type Action =
  | {
      type: "connecting";
      payload: {
        providerKey: ProviderKey;
      };
    }
  | {
      type: "connected";
      payload: {
        accounts: string[];
        chainId: string;
        providerKey: ProviderKey;
      };
    }
  | {
      type: "accountChanged";
      payload: {
        accounts: string[];
        providerKey: ProviderKey;
      };
    }
  | {
      type: "chainChanged";
      payload: {
        chainId: string;
        providerKey: ProviderKey;
      };
    }
  | {
      type: "disconnected";
      payload: {
        providerKey: ProviderKey;
      };
    }
  | {
      type: "selectedProviderChanged";
      payload: {
        providerKey: ProviderKey;
      };
    };

export type ConnectedState = {
  status: "connected";
  account: string;
  chainId: string;
  key: ProviderKey;
};
export type ConnectingState = {
  status: "connecting";
  account: null;
  chainId: null;
  key: ProviderKey;
};
export type ProviderState = ConnectedState | ConnectingState;
export type State = {
  selectedProvider: null | ProviderKey;
  connectedKeys: ProviderKey[];
  providers: Record<ProviderKey, ProviderState>;
};

export const initialState: State = {
  selectedProvider: null,
  connectedKeys: [],
  providers: {} as Record<ProviderKey, ProviderState>,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "connecting":
      return {
        ...state,
        providers: {
          ...state.providers,
          [action.payload.providerKey]: {
            status: "connecting",
            account: null,
            chainId: null,
            key: action.payload.providerKey,
          },
        },
      };
    case "connected":
      return {
        selectedProvider: action.payload.providerKey,
        connectedKeys: Array.from(
          new Set([...state.connectedKeys, action.payload.providerKey])
        ),
        providers: {
          ...state.providers,
          [action.payload.providerKey]: {
            status: "connected",
            account: action.payload.accounts[0],
            chainId: action.payload.chainId,
            key: action.payload.providerKey,
          },
        },
      };
    case "chainChanged":
      const providerState_chainChanged =
        state.providers[action.payload.providerKey];
      if (!providerState_chainChanged) {
        console.warn("Unreachable chainChanged. Please file an issue.");
        return state;
      }
      if (providerState_chainChanged.status === "connecting") return state;
      return {
        ...state,
        providers: {
          ...state.providers,
          [action.payload.providerKey]: {
            ...providerState_chainChanged,
            chainId: action.payload.chainId,
          },
        },
      };
    case "accountChanged":
      const providerState_accountChanged =
        state.providers[action.payload.providerKey];
      if (!providerState_accountChanged) {
        console.warn("Unreachable accountChanged. Please file an issue.");
        return state;
      }
      // MetaMask particular case
      if (action.payload.accounts.length === 0) {
        const isSelectedSigner =
          state.selectedProvider === action.payload.providerKey;
        const providersState_accountChanged = { ...state.providers };
        delete providersState_accountChanged[action.payload.providerKey];
        LocalStorageHelper.removeKey(action.payload.providerKey);
        return {
          selectedProvider: isSelectedSigner ? null : state.selectedProvider,
          connectedKeys: state.connectedKeys.filter(
            (key) => key !== action.payload.providerKey
          ),
          providers: providersState_accountChanged,
        };
      }
      if (providerState_accountChanged.status === "connecting") return state;
      return {
        ...state,
        providers: {
          ...state.providers,
          [action.payload.providerKey]: {
            ...providerState_accountChanged,
            account: action.payload.accounts[0],
          },
        },
      };
    case "disconnected":
      const isSelectedSigner =
        state.selectedProvider === action.payload.providerKey;
      const providersState_disconnected = { ...state.providers };
      delete providersState_disconnected[action.payload.providerKey];
      return {
        selectedProvider: isSelectedSigner ? null : state.selectedProvider,
        connectedKeys: state.connectedKeys.filter(
          (key) => key !== action.payload.providerKey
        ),
        providers: providersState_disconnected,
      };
    case "selectedProviderChanged":
      if (!state.connectedKeys.includes(action.payload.providerKey)) {
        console.warn("Invalid not connected provider selected.");
        return state;
      }
      return {
        ...state,
        selectedProvider: action.payload.providerKey,
      };
    default:
      return state;
  }
}
