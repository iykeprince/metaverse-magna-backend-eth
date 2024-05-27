import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_DURATION = process.env.JWT_DURATION as string;
export const PORT = process.env.PORT || 8000;

export const DATABASE_USER = process.env.DATABASE_USER as string;
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD as string;
export const DATABASE_NAME = process.env.DATABASE_NAME as string;
export const API_KEY = process.env.API_KEY as string;

export const RPC_ENDPOINTS = [
  `wss://mainnet.infura.io/ws/v3/${API_KEY}`,
  "wss://eth.public-rpc.com",
];


export const ETH_TO_USD = 5000;