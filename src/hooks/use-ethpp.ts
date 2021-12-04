import * as React from "react";
import { EthppContext } from "../provider";

export function useEthpp() {
  const context = React.useContext(EthppContext);

  if (!context) {
    throw new Error("`useEthpp` must be used within an `EthppProvider`");
  }

  return context;
}
