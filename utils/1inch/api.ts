import { I1InchSwapParams } from "../helpers";
import axios from "axios";

const API_BASE_URL = "https://api.1inch.dev";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY_1INCH;

const ENDPOINTS = {
  SWAP: "/swap/v6.0",
  TOKENS: "/token/v1.2",
  GATEWAY: "/tx-gateway/v1.1"
} as const;

interface SwapTransactionResponse {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
  toAmount: string;
  error?: string;
}

const api1inch = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Accept': 'application/json',
  }
});

const handleApiError = (error: any) => {
  if (error.response) {
    throw new Error(`API Error: ${error.response.data?.error || error.response.statusText}`);
  }
  throw error;
};

export const api1Inch = {
  async getTokens(chainId: number) {
    try {
      const response = await api1inch.get(`${ENDPOINTS.TOKENS}/${chainId}/search`, {
        params: {
          limit: '50',
        }
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      return []; 
    }
  },

  async buildSwapTransaction(
    swapParams: I1InchSwapParams,
    chainId: number
  ): Promise<SwapTransactionResponse> {
    try {
      const queryParams = new URLSearchParams({
        src: swapParams.src,
        dst: swapParams.dst,
        amount: swapParams.amount,
        from: swapParams.from,
        slippage: swapParams.slippage.toString(),
        ...(swapParams.includeTokensInfo && { includeTokensInfo: 'true' }),
        ...(swapParams.includeProtocols && { includeProtocols: 'true' }),
        ...(swapParams.includeGas && { includeGas: 'true' }),
      });

      const response = await api1inch.get(
        `${ENDPOINTS.SWAP}/${chainId}/swap?${queryParams.toString()}`
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error; 
    }
  },

  async broadcastTransaction(chainId: number, rawTransaction: string) {
    try {
      const response = await api1inch.post(
        `${ENDPOINTS.GATEWAY}/${chainId}/broadcast`,
        { rawTransaction }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error; 
    }
  }
};

export async function buildTxForSwap1Inch(
  swapParams: I1InchSwapParams,
  chainId: number
): Promise<SwapTransactionResponse['tx']> {
  try {
    const swapData = await api1Inch.buildSwapTransaction(swapParams, chainId);
    return swapData.tx;
  } catch (error) {
    console.error('Swap transaction build failed:', error);
    throw error;
  }
}
