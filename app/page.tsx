"use client";
import Image from "next/image";
import styles from "./page.module.css";
import ConnectIcon from '@/assets/images/icons/connect.svg';
import RightArrowIcon from '@/assets/images/icons/rightArrow.svg';
import LeftArrowIcon from '@/assets/images/icons/leftArrow.svg';
import SwapArrowIcon from '@/assets/images/icons/swapArrow.svg';
import SearchIcon from '@/assets/images/icons/search.svg';
import { useState } from 'react';
import { ChainId, ROUTER_ADDRESSES_1INCH, CHAIN_INFO } from '@/utils/constants';
import { useSwap1Inch } from '@/hooks/one-inch';
import { searchTokens, getChainName } from '@/utils/tokenSearch';
import { 
  calculateTokenExchangeWithLimit,
  type TokenPrices
} from '@/utils/tokenPrices';

const MAX_DIGITS = 15;

const processImageUri = (uri: string | undefined, tokenName?: string): string => {
  if (!uri && tokenName) {
    return generateTokenAvatar(tokenName);
  }
  
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

const generateTokenAvatar = (name: string): string => {
  const letter = name.charAt(0).toUpperCase();
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#EBF2FF"/>
      <text 
        x="16" 
        y="16" 
        dominant-baseline="central" 
        text-anchor="middle" 
        fill="#3B82F6" 
        font-family="system-ui, -apple-system, sans-serif"
        font-size="16"
        font-weight="500"
      >${letter}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
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

function isValidChainId(chainId: number): chainId is keyof typeof ROUTER_ADDRESSES_1INCH {
  return chainId in ROUTER_ADDRESSES_1INCH;
}

export default function Home() {
  const [showFromTokens, setShowFromTokens] = useState<boolean>(false);
  const [showToTokens, setShowToTokens] = useState<boolean>(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFromToken, setSelectedFromToken] = useState<SelectedToken>({ 
    symbol: 'ETH', 
    name: 'Ether',
    logoURI: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
    address: '0x0000000000000000000000000000000000000000'
  });
  
  const [selectedToToken, setSelectedToToken] = useState<SelectedToken | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(ChainId.ETHEREUM);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fromAmount, setFromAmount] = useState<string>("0");
  const [toAmount, setToAmount] = useState<string>("0");
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState(false);
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

  const validateNumberInput = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    let sanitized = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (sanitized.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = sanitized.split('.');
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Prevent leading zeros before decimal point
    if (sanitized.startsWith('0') && sanitized.length > 1 && sanitized[1] !== '.') {
      sanitized = sanitized.slice(1);
    }
    
    // Handle empty or invalid input
    if (sanitized === '' || sanitized === '.') {
      return '0';
    }
    
    return formatNumberToFit(sanitized);
  };

  const handleAmountChange = async (value: string, isFromToken: boolean) => {
    const validatedValue = validateNumberInput(value);

    if (isFromToken) {
      setFromAmount(validatedValue);
      setIsCalculating(true);
      setError(null);
      
      try {
        const numericValue = parseFloat(validatedValue);
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
          setToAmount(formatNumberToFit(exchangeAmount.toFixed(6)));
        }
      } catch (error) {
        console.error("Error calculating exchange amount:", error);
        setError(error instanceof Error ? error.message : "Failed to calculate exchange rate");
        setToAmount("0");
      } finally {
        setIsCalculating(false);
      }
    } else {
      setToAmount(formatNumberToFit(validatedValue));
    }
  };

  const formatNumberToFit = (value: string | number): string => {
    if (!value || value === '0') return '0';
    
    const numStr = value.toString();
    const [wholePart, decimalPart] = numStr.split('.');
    
    if (wholePart.length >= MAX_DIGITS) {
      return wholePart.slice(0, MAX_DIGITS);
    }
    
    if (decimalPart) {
      const maxDecimalPlaces = MAX_DIGITS - wholePart.length - 1; // -1 for decimal point
      if (maxDecimalPlaces <= 0) return wholePart;
      
      const truncatedDecimal = decimalPart.slice(0, maxDecimalPlaces);
      const cleanedDecimal = truncatedDecimal.replace(/0+$/, '');
      
      return cleanedDecimal ? `${wholePart}.${cleanedDecimal}` : wholePart;
    }
    
    return numStr;
  };

  const handleSwapValues = () => {
    if (!selectedToToken) return;

    setIsRotating(true);
    
    const tempFromAmount = fromAmount;
    const formattedToAmount = formatNumberToFit(toAmount);
    
    setFromAmount(formattedToAmount);
    setToAmount(formatNumberToFit(tempFromAmount));
    
    handleAmountChange(formattedToAmount, true);
    
    setTimeout(() => {
      setIsRotating(false);
    }, 200);
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div className={styles.logoWrapper}>
          <div className={styles.iconWrapper}>
            <img alt="" loading="lazy" src="https://cdn.1inch.io/logo-new-year.png"/>
          </div>
        </div>
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
                <div className={styles.tokenLabel}>
                  <a className={styles.tokenExplorerLink}>
                    You pay
                  </a>
                </div>
                <div className={styles.tokenInputContainer}>
                  <button 
                    onClick={handleFromTokenClick}
                    className={styles.tokenFromSelector}
                    type="button"
                  >
                    <Image 
                      src={processImageUri(selectedFromToken.logoURI, selectedFromToken.name)}
                      alt={`${selectedFromToken.symbol} icon`}
                      width={24}
                      height={24}
                      className={styles.tokenIcon}
                      unoptimized={!selectedFromToken.logoURI}
                    />
                    <span>{selectedFromToken.symbol}</span>
                    <RightArrowIcon width="17" height="17"/>
                  </button>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    className={styles.tokenInput}
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleAmountChange(e.target.value, true)}
                    onKeyDown={(e) => {
                      if (
                        !/[\d.]/.test(e.key) && 
                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                      if (e.key === '.' && fromAmount.includes('.')) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className={styles.tokenName}>
                  {selectedFromToken.name}
                </div>
              </div>
              
              <div className={styles.swapArrowContainer}>
                <button
                  onClick={handleSwapValues}
                  className={styles.swapArrow}
                  disabled={!selectedToToken}
                  type="button"
                >
                  <SwapArrowIcon width="10" height="10"/>
                </button>
              </div>

              <div className={styles.tokenBoxTransparent}>
                <div className={styles.tokenLabel}>You receive</div>
                <div className={styles.tokenInputContainer}>
                  {selectedToToken ? (
                    <button 
                      onClick={handleToTokenClick}
                      className={styles.tokenToSelector}
                      type="button"
                    >
                      <Image 
                        src={processImageUri(selectedToToken.logoURI, selectedToToken.name)}
                        alt={`${selectedToToken.symbol} icon`}
                        width={24}
                        height={24}
                        className={styles.tokenIcon}
                        unoptimized={!selectedToToken.logoURI}
                      />
                      <span>{selectedToToken.symbol}</span>
                      <RightArrowIcon width="17" height="17" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleToTokenClick}
                      className={styles.initialTokenToSelector}
                      type="button"
                    >
                      <span>Select a token</span>
                      <svg 
                        width="17" 
                        height="17" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M7 10L12 15L17 10" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                  <input 
                    type="text" 
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    className={styles.tokenInput}
                    placeholder="0.0"
                    value={isCalculating ? "" : toAmount}
                    readOnly
                  />
                </div>
                <div className={styles.tokenName}>
                  {selectedToToken?.name}
                </div>
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}
              </div>
            </div>

            {(showFromTokens || showToTokens) && (
              <>
                <div className={styles.backdrop} onClick={() => {
                  setShowFromTokens(false);
                  setShowToTokens(false);
                }} />
                <div className={styles.tokenListContainer}>
                  <div className={styles.tokenListHeader}>
                    <button 
                      onClick={() => showFromTokens ? setShowFromTokens(false) : setShowToTokens(false)} 
                      className={styles.backButton}
                      type="button"
                    >
                      <LeftArrowIcon width="17" height="17" />
                    </button>
                    <div className={styles.searchContainer}>
                      <SearchIcon width="24" height="24" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search by name or paste address"
                        className={styles.searchInput}
                      />
                    </div>
                    <div className={styles.chainSelector}>
                    {Object.entries(ROUTER_ADDRESSES_1INCH).map(([chainId, _]) => {
                        const numericChainId = Number(chainId) as ChainId;
                        const chain = CHAIN_INFO[numericChainId as keyof typeof CHAIN_INFO];
                        return (
                            <button
                                key={chainId}
                                onClick={() => handleChainSelect(Number(chainId) as ChainId)}
                                className={`${styles.chainButton} ${
                                    selectedChainId === Number(chainId) ? styles.activeChain : ''
                                }`}
                                type="button"
                            >
                                <Image 
                                    src={chain.icon}
                                    alt={chain.name}
                                    width={20}
                                    height={20}
                                    className={styles.chainIcon}
                                />
                                {chain.name}
                            </button>
                        )
                    })}
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
                          <div className={styles.tokenItemIcon}>
                            <Image 
                              src={processImageUri(token.logoURI, token.name)}
                              alt={token.symbol}
                              width={32}
                              height={32}
                              className={styles.tokenIcon}
                            />
                            <div>
                              <div className={styles.tokenSymbol}>
                                {token.symbol}
                              </div>
                              <div className={styles.tokenFullName}>
                                {token.name}
                              </div>
                            </div>
                          </div>
                          <div className={styles.tokenBalance}>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            <button 
              onClick={handleSwap}
              className={styles.connectButton}
              type="button"
            >
              <ConnectIcon width="24" height="24" />
              Connect wallet
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
