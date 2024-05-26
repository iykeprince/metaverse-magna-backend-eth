import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../../entities/User";
import { DATABASE_NAME, DATABASE_PASSWORD, DATABASE_USER } from "../../configs/config";

export const AppDataSource = new DataSource({
  type: "postgres",
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: ["./migrations/"],
  subscribers: [],
});
