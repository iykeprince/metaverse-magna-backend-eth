import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import "reflect-metadata";
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
import Container from "typedi";
import ProviderService from "./services/provider.service";
import { Transaction } from "./commons/types/transaction.type";
import { getSubscriptions } from "./commons/utils/subscription.util";

// const provider = new ethers.WebSocketProvider(
//   `wss://mainnet.infura.io/ws/v3/${API_KEY}`

// wss://mainnet.infura.io/ws/v3/  https://mainnet.infura.io/v3/036c2be6d80748cfad080c8ef28b4eae

export const init = () => {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  io.use(socketAuth);

  io.on(
    "connection",
    async (
      socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ) => {
      // ...
      console.log("New connection:", socket.data.user);

      await getSubscriptions(io, socket);

      io.on("disconnect", () => {
        console.log("Disconnected");
      });
    }
  );

  app.use(express.json());
  app.use("/auth", AuthController);

  return server;
};
export function listen(PORT: string | number, arg1: () => void) {
  throw new Error("Function not implemented.");
}
