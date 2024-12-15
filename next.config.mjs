/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true, 
          },
        },
      ],
    });
    return config;
  },
  images: {
    domains: [
      'tokens.1inch.io',
      'assets.coingecko.com',
      'raw.githubusercontent.com',
      's2.coinmarketcap.com',
      'asset-images.messari.io',
      'assets.smold.app',
      'tokens.pancakeswap.finance',
      'exchange.borgswap.exchange',
      'i.imgur.com',
      'tokens-data.1inch.io',
      'ipfs.io',
      'gateway.ipfs.io',   
      'dweb.link',
      'assets.spooky.fi',
      'cdn.furucombo.app',
      'ethereum-optimism.github.io',
      'snowtrace.io',
      'etherscan.io'
    ],
  },
};

export default nextConfig;
