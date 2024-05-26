import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import "reflect-metadata";
import { AppDataSource } from "./commons/db/data-source";
import AuthController from "./controllers/auth.controller";
import { socketAuth } from "./commons/middlewares/socket-auth.middleware";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import WebSocket from "ws";

// wss://mainnet.infura.io/ws/v3/  https://mainnet.infura.io/v3/036c2be6d80748cfad080c8ef28b4eae

const ws = new WebSocket(`wss://mainnet.infura.io/ws/v3/${API_KEY}`);
ws.on("open", () => {
  const subscriptionRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_subscribe",
    params: ["newHeads"],
  };

  ws.send(JSON.stringify(subscriptionRequest));
});

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
      ws.on("message", (message: any) => {
        // console.log("message:", JSON.stringify(message));
        io.emit("data", JSON.stringify(message));
      });

      ws.on("error", (err: any) => {
        console.log("error:", err);
        io.emit("error", err);
      });
      io.on("disconnect", () => {
        console.log("Disconnected");
        ws.close();
      });
    }
  );

  app.use(express.json());
  app.use("/auth", AuthController);

  AppDataSource.initialize().then(() => {
    app.listen(port, () => console.log(`Listening on port ${port}`));
  });
};
