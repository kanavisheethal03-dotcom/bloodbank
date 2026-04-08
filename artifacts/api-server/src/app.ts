import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
        <h1>Backend API Server Running</h1>
        <p>This is the backend server for the Blood Bank Management System.</p>
        <p>Please open the <b>Frontend Application</b> (usually at <a href="http://localhost:5173" style="color: #0066cc;">http://localhost:5173</a>) in your browser.</p>
      </body>
    </html>
  `);
});

app.use("/api", router);

export default app;
