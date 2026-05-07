import express, { type Express, type Request, type Response } from "express";
import pinoHttp from "pino-http";
import { createProxyMiddleware, type RequestHandler } from "http-proxy-middleware";
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

const djangoProxy = createProxyMiddleware({
  target: "http://localhost:8000",
  changeOrigin: true,
  on: {
    error: (err: Error, req: Request, res: Response) => {
      logger.error({ err }, "Django proxy error");
      if (!res.headersSent) {
        (res as Response).status(502).json({
          error: "Django backend unavailable",
          detail: "Ensure the Django server is running on port 8000",
        });
      }
    },
  },
}) as RequestHandler;

const wsProxy = createProxyMiddleware({
  target: "http://localhost:8000",
  changeOrigin: true,
  ws: true,
  on: {
    error: (err: Error) => {
      logger.error({ err }, "WebSocket proxy error");
    },
  },
}) as RequestHandler & { upgrade: (...args: unknown[]) => void };

app.use("/api", djangoProxy);
app.use("/ws", wsProxy);
app.use("/static", djangoProxy);

export { wsProxy };
export default app;
