import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import "reflect-metadata";
import AuthController from "./controllers/auth.controller";
import { socketAuth } from "./commons/middlewares/socket-auth.middleware";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getSubscriptions } from "./commons/utils/subscription.util";
import Container from "typedi";
import ProviderService from "./services/provider.service";

const providerService = Container.get(ProviderService);

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
      const provider = await providerService.getProvider()
      console.log("New connection:", socket.data.user);

      await getSubscriptions(io, socket);

      io.on("disconnect", () => {
        console.log("Disconnected");
        provider?.websocket.close();
      });
    }
  );

  app.use(express.json());
  app.use("/auth", AuthController);

  return server;
};
