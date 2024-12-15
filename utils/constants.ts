export enum ChainId {
    ETHEREUM = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GÖRLI = 5,
    KOVAN = 42,
    POLYGON = 137,
    POLYGON_TESTNET = 80001,
    FANTOM = 250,
    FANTOM_TESTNET = 4002,
    XDAI = 100,
    BSC_TESTNET = 97,
    ARBITRUM = 42161,
    AURORA = 1313161554,
    MOONBASE = 1287,
    AVALANCHE = 43114,
    FUJI = 43113,
    HECO = 128,
    HECO_TESTNET = 256,
    METIS = 1088,
    CRONOS = 25,
    GNOSIS = 100,
    OPTIMISM = 10,
    BOBA = 288,
    BINANCE = 56,
    TOMBCHAINTESTNET = 863,
    TOMB = 6969,
    BASE = 8453,
    LIF3CHAIN_TESTNET = 1811,
    ZKSYNC = 324,
    KLAYTN = 8217
  }

export const default1InchRouterAddress = '0x111111125421ca6dc452d289314280a0f8842a65'

export const ROUTER_ADDRESSES_1INCH = {
  [ChainId.ARBITRUM]: default1InchRouterAddress,
  [ChainId.FANTOM]: default1InchRouterAddress,
  [ChainId.BASE]: default1InchRouterAddress,
  [ChainId.POLYGON]: default1InchRouterAddress,
  [ChainId.ETHEREUM]: default1InchRouterAddress,
  [ChainId.OPTIMISM]: default1InchRouterAddress,
  [ChainId.AVALANCHE]: default1InchRouterAddress,
  [ChainId.ZKSYNC]: default1InchRouterAddress,
  [ChainId.GNOSIS]: default1InchRouterAddress,
  [ChainId.KLAYTN]: default1InchRouterAddress,
  [ChainId.BINANCE]: default1InchRouterAddress
}

export const CHAIN_INFO = {
  [ChainId.ETHEREUM]: {
    name: 'ETHEREUM',
    icon: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png'
  },
  [ChainId.ARBITRUM]: {
    name: 'ARBITRUM',
    icon: 'https://assets.coingecko.com/coins/images/16547/thumb/photo_2023-03-29_21.47.00.jpeg'
  },
  [ChainId.POLYGON]: {
    name: 'POLYGON',
    icon: 'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png'
  },
  [ChainId.OPTIMISM]: {
    name: 'OPTIMISM',
    icon: 'https://assets.coingecko.com/coins/images/25244/thumb/Optimism.png'
  },
  [ChainId.AVALANCHE]: {
    name: 'AVALANCHE',
    icon: 'https://tokens.1inch.io/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7.png'
  },
  [ChainId.GNOSIS]: {
    name: 'GNOSIS',
    icon: 'https://tokens.1inch.io/0x6810e776880c02933d47db1b9fc05908e5386b96.png'
  },
  [ChainId.BINANCE]: {
    name: 'BSC',
    icon: 'https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png'
  },
  [ChainId.BASE]: {
    name: 'BASE',
    icon: 'https://tokens.1inch.io/0x4200000000000000000000000000000000000006.png'
  },
  [ChainId.FANTOM]: {
    name: 'FANTOM',
    icon: 'https://tokens.1inch.io/0x4e15361fd6b4bb609fa63c81a2be19d873717870.png'
  },
  [ChainId.ZKSYNC]: {
    name: 'ZKSYNC',
    icon: 'https://tokens-data.1inch.io/images/0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e.png' 
  },
  [ChainId.KLAYTN]: {
    name: 'KLAYTN',
    icon: 'https://assets.coingecko.com/coins/images/9672/thumb/klaytn.png'
  }
} as const;