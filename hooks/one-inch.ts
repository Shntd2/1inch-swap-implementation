"use client";

import { buildTxForSwap1Inch } from "@/utils/1inch/api";
import { calculateGasMargin } from "@/utils/calculateGasMargin";
import { ROUTER_ADDRESSES_1INCH } from "@/utils/constants";
import { generate1InchSwapParmas, getSigner } from "@/utils/helpers";
import isZero from "@/utils/isZero";
import { BigNumber } from "@ethersproject/bignumber";
import { useWeb3React } from "@web3-react/core";
import { useMemo } from "react";

export const useSwap1Inch = () => {
  const chainId = 1;
  const { account, library } = useWeb3React();
  const typedValue = 1; // TO DO: get from input
  const router1Inch = ROUTER_ADDRESSES_1INCH[chainId];

  if (!account) return { swap1Inch: undefined };

  const from = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; // TO DO: set address from
  const to = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; // TO DO: set address to

  const swap1Inch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const swapParams = generate1InchSwapParmas(
      from,
      to,
      Number(typedValue),
      account,
      1,
      false, // disableEstimate
      false, // allowPartialFill
      true,  // includeTokensInfo
      true,  // includeProtocols
      true   // includeGas
    );

    const swapTransaction = await buildTxForSwap1Inch(swapParams, chainId);

    if (!swapTransaction) {
      throw new Error('Failed to build swap transaction');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const tx = {
        from: account,
        to: router1Inch,
        data: swapTransaction.data,
        ...(swapTransaction.value && !isZero(swapTransaction.value)
          ? { value: swapTransaction.value.toString(16) }
          : {}),
      };

      if (!library || !account) {
        throw new Error('Library or account not available');
      }

      const signer = getSigner(library);
      const estimate = await signer.estimateGas(tx);
      
      const newTxn = {
        ...tx,
        gasLimit: calculateGasMargin(estimate),
      };

      const response = await signer.sendTransaction(newTxn);
      if (!response.hash) {
        throw new Error(
          'Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.'
        );
      }
      
      return response;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { swap1Inch };
};
