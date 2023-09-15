import express from "express";
import router from "./routes/routes.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;
const app = express();
const mainRouter = router;

app.use("/test", mainRouter);
app.use(express.json());

app.listen(port, () => {
  console.log(`Conectado al puerto ${port}`);
});