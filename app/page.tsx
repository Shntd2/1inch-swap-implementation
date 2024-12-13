"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from 'react';
import { ChainId, ROUTER_ADDRESSES_1INCH } from '@/utils/constants';
import { useSwap1Inch } from '@/hooks/one-inch';
import { searchTokens, getChainName } from '@/utils/tokenSearch';
import { 
  calculateTokenExchangeWithLimit,
  type TokenPrices
} from '@/utils/tokenPrices';

const processImageUri = (uri: string | undefined): string => {
  if (!uri) return '/token-icon.png';
  
  if (uri.startsWith('ipfs://')) {
    const ipfsHash = uri.replace('ipfs://', '');
    return `https://dweb.link/ipfs/${ipfsHash}`;
  }
  
  if (uri.includes('dweb.link')) {
    if (uri.startsWith('https://')) {
      return uri;
    }
    return `https://${uri}`;
  }
  
  return uri;
};

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  tags?: {
    value: string;
    provider: string;
  }[];
}

interface SelectedToken {
  symbol: string;
  name: string;
  logoURI?: string;
  address: string;
}

interface TokenInputProps {
  amount: string;
  onAmountChange: (value: string) => void;
}

function isValidChainId(chainId: number): chainId is keyof typeof ROUTER_ADDRESSES_1INCH {
  return chainId in ROUTER_ADDRESSES_1INCH;
}

export default function Home() {
  const [showFromTokens, setShowFromTokens] = useState<boolean>(false);
  const [showToTokens, setShowToTokens] = useState<boolean>(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFromToken, setSelectedFromToken] = useState<SelectedToken>({ 
    symbol: 'WETH', 
    name: 'Wrapped Ether',
    logoURI: '/token-icon.png',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // WETH address on Ethereum
  });
  
  const [selectedToToken, setSelectedToToken] = useState<SelectedToken>({ 
    symbol: 'USDT', 
    name: 'Tether USD',
    logoURI: '/token-icon.png',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7' // USDT address on Ethereum
  });
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(ChainId.ETHEREUM);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fromAmount, setFromAmount] = useState<string>("0");
  const [toAmount, setToAmount] = useState<string>("0");
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const swapHook = useSwap1Inch();

  const fetchTokens = async (chainId: number): Promise<void> => {
    try {
      setIsLoading(true);
      if (!isValidChainId(chainId)) return;
      
      const chainName = getChainName(chainId as ChainId);
      const response = await searchTokens({
        query: searchQuery || chainName,
        chainId,
        limit: 50
      });
      
      console.log('Fetched tokens:', response.tokens); 
      setTokens(response.tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFromTokenClick = (): void => {
    setShowFromTokens(true);
    setShowToTokens(false);
    fetchTokens(selectedChainId);
  };

  const handleToTokenClick = (): void => {
    setShowToTokens(true);
    setShowFromTokens(false);
    fetchTokens(selectedChainId);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      fetchTokens(selectedChainId);
    }
  };

  const handleChainSelect = (chainId: ChainId) => {
    setSelectedChainId(chainId);
    setSearchQuery('');
    fetchTokens(chainId);
  };

  const handleTokenSelect = (token: Token, isFromToken: boolean): void => {
    if (isFromToken) {
      setSelectedFromToken({
        symbol: token.symbol,
        name: token.name,
        logoURI: token.logoURI,
        address: token.address
      });
      setShowFromTokens(false);
    } else {
      setSelectedToToken({
        symbol: token.symbol,
        name: token.name,
        logoURI: token.logoURI,
        address: token.address
      });
      setShowToTokens(false);
    }
  };

  const handleSwap = async () => {
    if (!swapHook?.swap1Inch) {
      console.error('Swap function not available');
      return;
    }
  
    try {
      const result = await swapHook.swap1Inch();
      console.log('Swap successful:', result);
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  const handleAmountChange = async (value: string, isFromToken: boolean) => {
    if (isFromToken) {
      setFromAmount(value);
      setIsCalculating(true);
      setError(null); 
      
      try {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
          setToAmount("0");
          return;
        }

        if (!selectedFromToken?.address || !selectedToToken?.address) {
          throw new Error("Token addresses not available");
        }

        const exchangeAmount = await calculateTokenExchangeWithLimit(
          selectedFromToken.address,
          selectedToToken.address,
          numericValue,
          selectedChainId
        );
        
        if (exchangeAmount !== null) {
          setToAmount(exchangeAmount.toFixed(6));
        } else {
          // throw new Error("Failed to calculate exchange amount");
        }
      } catch (error) {
        console.error("Error calculating exchange amount:", error);
        setError(error instanceof Error ? error.message : "Failed to calculate exchange rate");
        setToAmount("0");
      } finally {
        setIsCalculating(false);
      }
    } else {
      setToAmount(value);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>1inch DEX Aggregator Interface</p>
      </div>

      <div className={styles.center}>
        <div className={styles.swapContainer}>
          <div className={styles.swapCard}>
            <div className={styles.swapHeader}>
              <button className={styles.swapTab}>Swap</button>
              <button className={`${styles.swapTab} ${styles.inactive}`}>Limit</button>
            </div>
            
            <div className={styles.swapContent}>
              <div className={styles.tokenBox}>
                <div className={styles.tokenLabel}>You pay</div>
                <div className={styles.tokenInputContainer}>
                  <button 
                    onClick={handleFromTokenClick}
                    className={styles.tokenSelector}
                    type="button"
                  >
                    <Image 
                      src={processImageUri(selectedFromToken.logoURI)}
                      alt={`${selectedFromToken.symbol} icon`}
                      width={24}
                      height={24}
                      className={styles.tokenIcon}
                    />
                    <span>{selectedFromToken.symbol}</span>
                  </button>
                  <input 
                    type="text" 
                    className={styles.tokenInput}
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleAmountChange(e.target.value, true)}
                  />
                </div>
                <div className={styles.tokenName}>
                  {selectedFromToken.name}
                </div>
              </div>

              <div className={styles.tokenBox}>
                <div className={styles.tokenLabel}>You receive</div>
                <div className={styles.tokenInputContainer}>
                  <button 
                    onClick={handleToTokenClick}
                    className={styles.tokenSelector}
                    type="button"
                  >
                    <Image 
                      src={processImageUri(selectedToToken.logoURI)}
                      alt={`${selectedToToken.symbol} icon`}
                      width={24}
                      height={24}
                      className={styles.tokenIcon}
                    />
                    <span>{selectedToToken.symbol}</span>
                  </button>
                  <input 
                    type="text" 
                    className={styles.tokenInput}
                    placeholder="0.0"
                    value={isCalculating ? "Calculating..." : toAmount}
                    readOnly
                  />
                </div>
                <div className={styles.tokenName}>
                  {selectedToToken.name}
                </div>
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}
              </div>
            </div>

            {(showFromTokens || showToTokens) && (
              <div className={styles.tokenListContainer}>
                <div className={styles.tokenListHeader}>
                  <button 
                    onClick={() => showFromTokens ? setShowFromTokens(false) : setShowToTokens(false)} 
                    className={styles.backButton}
                    type="button"
                  >
                    ←
                  </button>
                  <div className={styles.searchContainer}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search by name or paste address"
                      className={styles.searchInput}
                    />
                  </div>
                  <div className={styles.chainSelector}>
                    {Object.entries(ROUTER_ADDRESSES_1INCH).map(([chainId, _]) => (
                      <button
                        key={chainId}
                        onClick={() => handleChainSelect(Number(chainId) as ChainId)}
                        className={`${styles.chainButton} ${
                          selectedChainId === Number(chainId) ? styles.activeChain : ''
                        }`}
                        type="button"
                      >
                        {getChainName(Number(chainId) as ChainId)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.tokenList}>
                  {isLoading ? (
                    <div className={styles.loadingContainer}>Loading tokens...</div>
                  ) : (
                    tokens.map((token, index) => (
                      <div 
                        key={`${token.address}-${index}`}
                        className={styles.tokenListItem}
                        onClick={() => handleTokenSelect(token, showFromTokens)}
                        role="button"
                        tabIndex={0}
                      >
                        <Image 
                          src={processImageUri(token.logoURI)}
                          alt={token.symbol}
                          width={24}
                          height={24}
                          className={styles.tokenIcon}
                        />
                        <div>
                          <div className={styles.tokenSymbol}>{token.symbol}</div>
                          <div className={styles.tokenFullName}>{token.name}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button 
              onClick={handleSwap}
              className={styles.connectButton}
              type="button"
            >
              Connect wallet
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
