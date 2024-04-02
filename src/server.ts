import { Application } from "express";
import express from "express";
import router from "./controllers";

const app: Application = express();
app.use(express.json());

const PORT = 3000;
app.use(router);
app
  .listen(PORT, async () => {
    console.log(`server running on port : ${PORT}`);
  })
  .on("error", (e) => console.error(e));
