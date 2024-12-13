import axios from 'axios';
import { ChainId } from './constants';

interface TokenSearchConfig {
  query: string;
  chainId: number;
  ignoreListed?: boolean;
  onlyPositiveRating?: boolean;
  limit?: number;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  eip2612?: boolean;
  isFoT?: boolean;
  providers?: string[];
  rating?: string;
  tags?: {
    value: string;
    provider: string;
  }[];
}

export const searchTokens = async ({
  query,
  chainId,
  ignoreListed = true,
  onlyPositiveRating = true,
  limit = 50
}: TokenSearchConfig): Promise<{ tokens: Token[] }> => {
  try {
    const response = await axios.get('/api/tokens', {
      params: {
        chainId,
        query,
        ignore_listed: ignoreListed.toString(),
        only_positive_rating: onlyPositiveRating.toString(),
        limit: limit.toString()
      }
    });

    return { tokens: Array.isArray(response.data) ? response.data : [] };
  } catch (error) {
    console.error('Token search failed:', error);
    throw error;
  }
};

export const getChainName = (chainId: ChainId): string => {
  const chainNames: Record<number, string> = {
    [ChainId.ETHEREUM]: 'ETHEREUM',
    [ChainId.ARBITRUM]: 'ARBITRUM',
    [ChainId.POLYGON]: 'POLYGON',
    [ChainId.OPTIMISM]: 'OPTIMISM',
    [ChainId.BASE]: 'BASE',
    [ChainId.FANTOM]: 'FANTOM',
    [ChainId.AURORA]: 'AURORA',
    [ChainId.AVALANCHE]: 'AVALANCHE',
    [ChainId.ZKSYNC]: 'ZKSYNC',
    [ChainId.GNOSIS]: 'GNOSIS',
    [ChainId.KLAYTN]: 'KLAYTN',
    [ChainId.BINANCE]: 'BINANCE'
  };
  
  return chainNames[chainId] || 'UNKNOWN';
};
