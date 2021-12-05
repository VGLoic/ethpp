import * as React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { EthppProvider } from "ethpp";

// MetaMask is injected in the default connectors
// Alternatively, one case explicitly define the providers and use the object as props of the provider
// const providerConnectors = defineProviders({
//   MetaMask: new MetaMaskConnector()
// });

ReactDOM.render(
  <React.StrictMode>
    <EthppProvider>
      <App />
    </EthppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
