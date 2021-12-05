import * as React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { EthppProvider } from "ethpp";
import { defineProviders } from "ethpp/lib/end-dev/index";

const providerConnectors = defineProviders({});

ReactDOM.render(
  <React.StrictMode>
    <EthppProvider connectors={providerConnectors}>
      <App />
    </EthppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
