import express from "express";
import usersRouter from "../../routes/users";
import bodyParser from "body-parser";

export function createApp() {
  const app = express();

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use("/api/users", usersRouter);

  return app;
}
