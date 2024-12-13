import axios from 'axios';

export interface TokenPrices {
  [tokenAddress: string]: number;
}

export async function getWhitelistedTokenPrices(chainId: number = 1): Promise<TokenPrices> {
  try {
    const response = await axios.get(`/api/prices?chainId=${chainId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch whitelisted token prices:", error);
    throw error;
  }
}

export async function getRequestedTokenPrices(tokens: string[], chainId: number = 1): Promise<TokenPrices> {
  try {
    const response = await axios.post('/api/prices', { tokens, chainId });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch requested token prices:", error);
    throw error;
  }
}

export async function getPricesForAddresses(addresses: string[], chainId: number = 1): Promise<TokenPrices> {
  try {
    const addressesString = addresses.join(',');
    const response = await axios.get(`/api/prices?chainId=${chainId}&addresses=${addressesString}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch prices for addresses:", error);
    throw error;
  }
}

export async function calculateTokenExchange(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: number,
  chainId: number = 1
): Promise<number | null> {
  try {
    const prices = await getPricesForAddresses([fromTokenAddress, toTokenAddress], chainId);
    
    if (!prices[fromTokenAddress] || !prices[toTokenAddress]) {
      throw new Error("Could not fetch prices for one or both tokens");
    }

    const fromTokenPrice = prices[fromTokenAddress];
    const toTokenPrice = prices[toTokenAddress];
    
    const exchangeAmount = (amount * fromTokenPrice) / toTokenPrice;
    
    return exchangeAmount;
  } catch (error) {
    console.error("Failed to calculate token exchange:", error);
    return null;
  }
}

const RATE_LIMIT_DELAY = 2000; 

export function withRateLimit<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  let lastCall = 0;
  
  return (async (...args: Parameters<T>) => {
    const now = Date.now();
    const timeToWait = Math.max(0, RATE_LIMIT_DELAY - (now - lastCall));
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    lastCall = Date.now();
    return fn(...args);
  }) as T;
}

export const getWhitelistedTokenPricesWithLimit = withRateLimit(getWhitelistedTokenPrices);
export const getRequestedTokenPricesWithLimit = withRateLimit(getRequestedTokenPrices);
export const getPricesForAddressesWithLimit = withRateLimit(getPricesForAddresses);
export const calculateTokenExchangeWithLimit = withRateLimit(calculateTokenExchange);
