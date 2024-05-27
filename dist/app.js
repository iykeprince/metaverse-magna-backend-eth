"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
require("reflect-metadata");
const data_source_1 = require("./commons/db/data-source");
const auth_controller_1 = __importDefault(require("./controllers/auth.controller"));
const socket_auth_middleware_1 = require("./commons/middlewares/socket-auth.middleware");
const config_1 = require("./configs/config");
const ethers_1 = require("ethers");
const provider = new ethers_1.ethers.WebSocketProvider(`wss://mainnet.infura.io/ws/v3/${config_1.API_KEY}`);
const extractTransactionDetails = (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const block = yield provider.getBlock(blockNumber, true);
        let arr = [];
        block === null || block === void 0 ? void 0 : block.prefetchedTransactions.forEach((tx) => {
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
    }
    catch (error) {
        console.error("Error fetching block or transactions:", error);
    }
});
// wss://mainnet.infura.io/ws/v3/  https://mainnet.infura.io/v3/036c2be6d80748cfad080c8ef28b4eae
// const ws = new WebSocket(`wss://eth.public-rpc.com`);
// const ws = new WebSocket(`wss://mainnet.infura.io/ws/v3/${API_KEY}`);
// ws.on("open", () => {
//   const subscriptionRequest = {
//     jsonrpc: "2.0",
//     method: "eth_blockNumber",
//     params: [],
//     id: 1,
//   };
//   //   const subscriptionRequest = {
//   //     jsonrpc: "2.0",
//   //     id: 1,
//   //     method: "eth_subscribe",
//   //     params: ["newPendingTransactions"],
//   //   };
//   ws.send(JSON.stringify(subscriptionRequest));
// });
const init = (port) => {
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server);
    io.use(socket_auth_middleware_1.socketAuth);
    io.on("connection", (socket) => {
        // ...
        console.log("New connection:", socket.username);
        // Subscribe to all events
        socket.on("subscribe:all", () => {
            // Emit all events to the client
            provider.on("block", (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield extractTransactionDetails(blockNumber);
                io.emit("event", data);
            }));
        });
        // Subscribe to events where address is either sender or receiver
        socket.on("subscribe:both", (payload) => {
            // Emit events where address is either sender or receiver
            provider.on("block", (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield extractTransactionDetails(blockNumber);
                const filteredResult = data === null || data === void 0 ? void 0 : data.filter((event) => event.SenderAddress === payload.sender ||
                    event.ReceiverAddress === payload.receiver);
                io.emit("result", filteredResult);
            }));
        });
        //   // Subscribe to events where address is the sender
        socket.on("sender", (payload) => {
            // Emit events where address is the sender
            provider.on("block", (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield extractTransactionDetails(blockNumber);
                const filteredResult = data === null || data === void 0 ? void 0 : data.filter((event) => event.SenderAddress === payload.sender);
                io.emit("result", filteredResult);
            }));
        });
        //   // Subscribe to events where address is the receiver
        socket.on("receiver", (payload) => {
            // Emit events where address is the receiver
            provider.on("block", (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield extractTransactionDetails(blockNumber);
                const filteredResult = data === null || data === void 0 ? void 0 : data.filter((event) => event.ReceiverAddress === payload.receiver);
                io.emit("result", filteredResult);
            }));
        });
        // Subscribe to events within price ranges
        //   socket.on("subscribe:price_range", (range) => {
        //     // Emit events within the specified price range
        //     provider.on("block", async  (blockNumber) => {
        //         const data = await extractTransactionDetails(blockNumber);
        //       const ethToUsd = 5000; // 1 ETH = $5,000
        //       const amountInUSD = data![0].ValueInWEI * ethToUsd;
        //       switch (range) {
        //         case "a":
        //           if (amountInUSD >= 0 && amountInUSD <= 100) {
        //             socket.emit("event", event);
        //           }
        //           break;
        //         case "b":
        //           if (amountInUSD > 100 && amountInUSD <= 500) {
        //             socket.emit("event", event);
        //           }
        //           break;
        //         case "c":
        //           if (amountInUSD > 500 && amountInUSD <= 2000) {
        //             socket.emit("event", event);
        //           }
        //           break;
        //         case "d":
        //           if (amountInUSD > 2000 && amountInUSD <= 5000) {
        //             socket.emit("event", event);
        //           }
        //           break;
        //         case "e":
        //           if (amountInUSD > 5000) {
        //             socket.emit("event", event);
        //           }
        //           break;
        //         default:
        //           break;
        //       }
        //     });
        //   });
        io.on("disconnect", () => {
            console.log("Disconnected");
            // ws.close();
        });
    });
    app.use(express_1.default.json());
    app.use("/auth", auth_controller_1.default);
    data_source_1.AppDataSource.initialize().then(() => {
        io.listen(8001, {});
        app.listen(port, () => console.log(`Listening on port ${port}`));
    });
};
exports.init = init;
