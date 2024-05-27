import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import "reflect-metadata";
import { AppDataSource } from "./commons/db/data-source";
import AuthController from "./controllers/auth.controller";
import { socketAuth } from "./commons/middlewares/socket-auth.middleware";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { API_KEY } from "./configs/config";
import { ethers } from "ethers";
import {
  ALL_EVENT,
  BOTH_EVENT,
  PRICE_RANGE_EVENT,
  RECEIVER_EVENT,
  SENDER_EVENT,
} from "./configs/event.config";

type Transaction = {
  SenderAddress: string;
  ReceiverAddress: string | null;
  BlockNumber: number;
  BlockHash: string | null;
  TransactionHash: string;
  GasPriceInWEI: number;
  ValueInWEI: number;
};

const provider = new ethers.WebSocketProvider(
  `wss://mainnet.infura.io/ws/v3/${API_KEY}`
);

const extractTransactionDetails = async (blockNumber: number) => {
  try {
    const block = await provider.getBlock(blockNumber, true);
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

// wss://mainnet.infura.io/ws/v3/  https://mainnet.infura.io/v3/036c2be6d80748cfad080c8ef28b4eae

export const init = (port: number) => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  io.use(socketAuth);

  io.on(
    "connection",
    (
      socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ) => {
      // ...
      console.log("New connection:", (socket as any).username);

      // Subscribe to all events
      socket.on(ALL_EVENT, () => {
        // Emit all events to the client
        provider.on("block", async (blockNumber) => {
          const data = await extractTransactionDetails(blockNumber);
          io.emit("event", data);
        });
      });
      // Subscribe to events where address is either sender or receiver
      socket.on(BOTH_EVENT, (payload) => {
        // Emit events where address is either sender or receiver
        provider.on("block", async (blockNumber) => {
          const data = await extractTransactionDetails(blockNumber);
          const filteredResult = data?.filter(
            (event) =>
              event.SenderAddress === payload.sender ||
              event.ReceiverAddress === payload.receiver
          );

          io.emit("result", filteredResult);
        });
      });

      //   // Subscribe to events where address is the sender
      socket.on(SENDER_EVENT, (payload) => {
        // Emit events where address is the sender
        provider.on("block", async (blockNumber) => {
          const data = await extractTransactionDetails(blockNumber);
          const filteredResult = data?.filter(
            (event) => event.SenderAddress === payload.sender
          );
          io.emit("result", filteredResult);
        });
      });

      //   // Subscribe to events where address is the receiver
      socket.on(RECEIVER_EVENT, (payload) => {
        // Emit events where address is the receiver

        provider.on("block", async (blockNumber) => {
          const data = await extractTransactionDetails(blockNumber);
          const filteredResult = data?.filter(
            (event) => event.ReceiverAddress === payload.receiver
          );
          io.emit("result", filteredResult);
        });
      });
      // Subscribe to events within price ranges
      // socket.on(PRICE_RANGE_EVENT, (range) => {
      //   // Emit events within the specified price range
      //   provider.on("block", async  (blockNumber) => {
      //       const data = await extractTransactionDetails(blockNumber);
      //     const ethToUsd = 5000; // 1 ETH = $5,000
      //     const amountInUSD = data![0].ValueInWEI * ethToUsd;
      //     switch (range) {
      //       case "a":
      //         if (amountInUSD >= 0 && amountInUSD <= 100) {
      //           socket.emit("event", event);
      //         }
      //         break;
      //       case "b":
      //         if (amountInUSD > 100 && amountInUSD <= 500) {
      //           socket.emit("event", event);
      //         }
      //         break;
      //       case "c":
      //         if (amountInUSD > 500 && amountInUSD <= 2000) {
      //           socket.emit("event", event);
      //         }
      //         break;
      //       case "d":
      //         if (amountInUSD > 2000 && amountInUSD <= 5000) {
      //           socket.emit("event", event);
      //         }
      //         break;
      //       case "e":
      //         if (amountInUSD > 5000) {
      //           socket.emit("event", event);
      //         }
      //         break;
      //       default:
      //         break;
      //     }
      //   });
      // });

      io.on("disconnect", () => {
        console.log("Disconnected");
      });
    }
  );

  app.use(express.json());
  app.use("/auth", AuthController);

  AppDataSource.initialize().then(() => {
    io.listen(8001, {});
    app.listen(port, () => console.log(`Listening on port ${port}`));
  });
};
