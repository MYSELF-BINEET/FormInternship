import "reflect-metadata";
import { DataSource } from "typeorm";
import { Form } from "./models/formModel";
import { FormResponse } from "./models/formResponseModel";
import dotenv from "dotenv";
import { User } from "./models/userModel";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",         // Use "mysql" for MySQL
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  synchronize: true,        // Use only in development
  logging: false,
  entities: [Form,FormResponse,User],
  migrations: [],
  subscribers: [],
});
