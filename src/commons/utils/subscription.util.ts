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

const providerService = Container.get(ProviderService);

export const getSubscriptions = async (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  const provider = await providerService.getProvider();
  console.log("provider", provider?._network.name);

  provider?.on("block", async (blockNumber) => {
    const data = await extractTransactionDetails(blockNumber);

    // Subscribe to all events
    socket.on(ALL_EVENT, () => {
      // Emit all events to the client
      io.emit(ALL_EVENT, data);
    });

    // Subscribe to events where address is either sender or receiver
    socket.on(BOTH_EVENT, (message) => {
      // Emit events where address is either sender or receiver
      const { payload } = message;
      const filteredResult = data?.filter(
        (event: Transaction) =>
          event.SenderAddress === payload.sender ||
          event.ReceiverAddress === payload.receiver
      );

      io.emit(BOTH_EVENT, filteredResult);
    });

    // Subscribe to events where address is the sender
    socket.on(SENDER_EVENT, (message) => {
      // Emit events where address is the sender
      const { payload } = message;
      const filteredResult = data?.filter(
        (event: any) => event.SenderAddress === payload.sender
      );
      io.emit(SENDER_EVENT, filteredResult);
    });

    // Subscribe to events where address is the receiver
    socket.on(RECEIVER_EVENT, (message) => {
      // Emit events where address is the receiver
      const { payload } = message;

      const filteredResult = data?.filter(
        (event: any) => event.ReceiverAddress === payload.receiver
      );
      io.emit(RECEIVER_EVENT, filteredResult);
    });

    // Subscribe to events within price ranges
    socket.on(PRICE_RANGE_EVENT, (message) => {
      const { range } = message;
      // Emit events within the specified price range
      const transactions = (data as Transaction[]).map((transaction) => {
        const amountInUSD = exchangeAmountInUSD(transaction.ValueInWEI);
        switch (range) {
          case amountInUSD >= 0 && amountInUSD <= 100:
            return transaction;

          case amountInUSD > 100 && amountInUSD <= 500:
            return transaction;

          case amountInUSD > 500 && amountInUSD <= 2000:
            return transaction;
          case amountInUSD > 2000 && amountInUSD <= 5000:
            return transaction;

          case amountInUSD > 5000:
            return transaction;
          default:
            // not valid range
            break;
        }
      });

      socket.emit(PRICE_RANGE_EVENT, transactions);
    });
  });
};

const exchangeAmountInUSD = (value: number) => value * ETH_TO_USD;

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
      console.log(data);
      arr.push(data);
    });

    return arr;
  } catch (error) {
    console.error("Error fetching block or transactions:", error);
  }
};
