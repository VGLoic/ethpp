import * as React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  defineProviders,
  EthppProvider,
  MetaMaskConnector,
  WalletConnectConnector,
} from "ethpp";

const providerConnectors = defineProviders({
  MetaMask: new MetaMaskConnector(),
  WalletConnect: new WalletConnectConnector({
    // DO NOT USE THIS ID IN PRODUCTION
    infuraId: "28a17c0e5fc4469eb172f9f90bbfa457",
  }),
});

ReactDOM.render(
  <React.StrictMode>
    <EthppProvider providerConnectors={providerConnectors}>
      <App />
    </EthppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
