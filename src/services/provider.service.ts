import { ethers } from "ethers";
import { RPC_ENDPOINTS } from "../configs/config";
import { Transaction } from "../commons/types/transaction.type";
import { Service } from "typedi";

@Service()
class ProviderService {
  rpcEndpoints: string[];
  currentProviderIndex: number;
  provider: ethers.WebSocketProvider | null;

  constructor() {
    this.rpcEndpoints = [...RPC_ENDPOINTS];
    this.currentProviderIndex = 0;
    this.provider = null;
  }

  async initializeProvider() {
    while (this.rpcEndpoints.length > 0) {
      const endpoint = this.rpcEndpoints[this.currentProviderIndex];
      try {
        this.provider = new ethers.WebSocketProvider(endpoint);
        return new Promise((resolve, reject) => {
          this.provider?.on("block", async (blockNumber) => {
            try {
              resolve(blockNumber);
            } catch (error) {
              reject(error);
            }
          });
        });
      } catch (error) {
        console.error(`Failed to connect to ${endpoint}:`, error);
        this.rpcEndpoints.splice(this.currentProviderIndex, 1);
        this.currentProviderIndex =
          this.currentProviderIndex % this.rpcEndpoints.length;
      }
    }
    throw new Error("No RPC endpoints available.");
  }

  async getProvider() {
    if (
      !this.provider ||
      !this.provider.websocket ||
      this.provider.websocket.readyState !== 1
    ) {
      await this.initializeProvider();
    }
    return this.provider;
  }

  async switchProvider() {
    if (this.provider) {
      this.provider.websocket.close();
    }
    this.currentProviderIndex =
      (this.currentProviderIndex + 1) % this.rpcEndpoints.length;
    await this.initializeProvider();
  }
}

export default ProviderService;
