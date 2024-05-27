import {
  ALL_EVENT,
  BOTH_EVENT,
  SENDER_EVENT,
  RECEIVER_EVENT,
  PRICE_RANGE_EVENT,
  DATA_EVENT,
} from "../../configs/event.config";
import Container from "typedi";
import ProviderService from "../../services/provider.service";
import { Transaction } from "../types/transaction.type";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ETH_TO_USD } from "../../configs/config";
import { ethers } from "ethers";

const providerService = Container.get(ProviderService);

export const getSubscriptions = async (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  const provider = await providerService.getProvider();
  console.log("provider", provider?._network.name);

  // Subscribe to all events
  provider?.on("block", async (blockNumber) => {
    const data = await extractTransactionDetails(blockNumber);
    io.emit(ALL_EVENT, data);
  });

  // Subscribe to events where address is either sender or receiver
  socket.on(BOTH_EVENT, (message) => {
    // Emit events where address is either sender or receiver
    const { payload } = message;
    provider?.on("block", async (blockNumber) => {
      const data = await extractTransactionDetails(blockNumber);
      const filteredResult = data?.filter(
        (event: Transaction) =>
          event.SenderAddress === payload.sender ||
          event.ReceiverAddress === payload.receiver
      );

      io.emit(BOTH_EVENT, filteredResult);
    });
  });

  // Subscribe to events where address is the sender
  socket.on(SENDER_EVENT, (message) => {
    // Emit events where address is the sender
    const { payload } = message;
    provider?.on("block", async (blockNumber) => {
      const data = await extractTransactionDetails(blockNumber);
      const filteredResult = data?.filter(
        (event: any) => event.SenderAddress === payload.sender
      );
      io.emit(SENDER_EVENT, filteredResult);
    });
  });

  // Subscribe to events where address is the receiver
  socket.on(RECEIVER_EVENT, (message) => {
    // Emit events where address is the receiver
    const { payload } = message;
    provider?.on("block", async (blockNumber) => {
      const data = await extractTransactionDetails(blockNumber);
      const filteredResult = data?.filter(
        (event: any) => event.ReceiverAddress === payload.receiver
      );
      io.emit(RECEIVER_EVENT, filteredResult);
    });
  });

  // Subscribe to events within price ranges
  socket.on(PRICE_RANGE_EVENT, (message) => {
    const { range } = message;

    provider?.on("block", async (blockNumber) => {
      const data = await extractTransactionDetails(blockNumber);
      // Emit events within the specified price range
      let minRange = 0;
      let maxRange = 0;

      switch (range) {
        case "0-100":
          minRange = 0;
          maxRange = 100;
          break;
        case "100-500":
          minRange = 100;
          maxRange = 500;
          break;
        case "500-2000":
          minRange = 500;
          maxRange = 2000;
          break;
        case "2000-5000":
          minRange = 2000;
          maxRange = 5000;
          break;
        case ">5000":
          minRange = 5000;
          break;
        default:
          // Invalid filter
          console.log("invalid filter range");
          return;
      }
      const transactions = (data as Transaction[]).map((transaction) => {
        const amountInUSD = exchangeAmountInUSD(transaction.ValueInWEI);
        if (amountInUSD >= minRange && amountInUSD <= maxRange) {
          return transaction;
        }
      });

      socket.emit(
        PRICE_RANGE_EVENT,
        transactions.filter((tx) => tx !== null)
      );
    });
  });
};

const exchangeAmountInUSD = (value: number) => {
  // Convert Wei to Ether
  const weiBigInt = BigInt(value);

  // Convert Wei to Ether
  const etherAmount = ethers.formatUnits(weiBigInt.toString(), "ether");
  console.log("ether value", etherAmount);
  console.log("usd value", parseFloat(etherAmount) * ETH_TO_USD);
  return parseFloat(etherAmount) * ETH_TO_USD;
};

const extractTransactionDetails = async (blockNumber: number) => {
  const provider = await providerService.getProvider();
  try {
    const block = await provider?.getBlock(blockNumber, true);
    let arr: Transaction[] = [];
    block?.prefetchedTransactions.forEach((tx) => {
      const data = {
        SenderAddress: tx.from,
        ReceiverAddress: tx.to,
        BlockNumber: block.number,
        BlockHash: block.hash,
        TransactionHash: tx.hash,
        GasPriceInWEI: Number(tx.gasPrice),
        ValueInWEI: Number(tx.value),
      };
      arr.push(data);
    });

    return arr;
  } catch (error) {
    console.error("Error fetching block or transactions:", error);
  }
};
