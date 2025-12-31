import "dotenv/config";
import express from "express";
import routes from "./routes/index.js";

const app = express();
app.use(express.json());

app.use('/api', routes)

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Webhook escuchando en http://localhost:${PORT}/api/webhook`);
});
