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
    infuraId: "2a87df81c01d4b899fc500d75bfce19d",
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
