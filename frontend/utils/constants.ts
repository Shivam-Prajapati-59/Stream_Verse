// utils/constants.ts
export const PAYMENT_CONFIG = {
  // Price in smallest unit (0.001 USDC = 1000 with 6 decimals)
  PRICE_AMOUNT: "1000",

  // USDC contract address on Polygon Amoy
  USDC_ADDRESS: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",

  // USDC decimals
  USDC_DECIMALS: 6,

  // EIP712 configuration for USDC
  USDC_EIP712: {
    name: "USDC",
    version: "1",
    primaryType: "TransferWithAuthorization",
  },
} as const;

export const CHAIN_CONFIG = {
  POLYGON_AMOY_CHAIN_ID: 80002,
  RPC_URL: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
} as const;

export const THIRDWEB_CONFIG = {
  CLIENT_ID:
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
    "6303a434ecfb15cd95c80cb562bba137",
  SECRET_KEY: process.env.THIRDWEB_SECRET_KEY,
  SERVER_WALLET: process.env.SERVER_WALLET_ADDRESS,
} as const;

export const VIDEO_CONFIG = {
  DEFAULT_PRICE: "$0.01",
  DEFAULT_CURRENCY: "USDC",
} as const;
