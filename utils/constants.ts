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
  [ChainId.AURORA]: default1InchRouterAddress,
  [ChainId.AVALANCHE]: default1InchRouterAddress,
  [ChainId.ZKSYNC]: default1InchRouterAddress,
  [ChainId.GNOSIS]: default1InchRouterAddress,
  [ChainId.KLAYTN]: default1InchRouterAddress,
  [ChainId.BINANCE]: default1InchRouterAddress
}
