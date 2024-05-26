import { NextFunction } from "express";
import { Socket } from "socket.io";
import { validAuthToken } from "../utils/auth.util";
import { JWT_SECRET } from "../../configs/config";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const socketAuth = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  next: (err?: ExtendedError | undefined) => void
) => {
  const token = socket.handshake.headers.authorization;
  if (!token) return next(new Error("Missing authorization"));
  if (!validAuthToken(token, JWT_SECRET))
    return next(new Error("Invalid authorization"));
  next();
};
