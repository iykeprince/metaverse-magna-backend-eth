import { NextFunction } from "express";
import { Socket } from "socket.io";
import { validAuthToken } from "../utils/auth.util";
import { JWT_SECRET } from "../../configs/config";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import jwt from "jsonwebtoken";

export const socketAuth = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  next: (err?: ExtendedError | undefined) => void
) => {
  const token = socket.handshake.headers.authorization;
  if (!token) return next(new Error("Unauthorized"));

  const decoded: any = jwt.verify(token, JWT_SECRET);

  socket.data["user"] = decoded;
  next();
};
