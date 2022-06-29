import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(
  "/",
  createProxyMiddleware({
    target: "",
    changeOrigin: true,
    pathRewrite: {
      [`^/`]: "",
    },
    router: (req: Request) => {
      const proxyTarget = req.headers["proxy-target"];
      if (proxyTarget) {
        const proxyTarget = req.headers["proxy-target"] as string;
        if (
          !(
            proxyTarget.startsWith("https://") ||
            proxyTarget.startsWith("http://")
          )
        ) {
          throw {
            code: "ProxyTargetInvalid",
            message: "Please provide proper hostname with https or http",
            status: 400,
          };
        }
        return proxyTarget;
      } else {
        throw {
          code: "ProxyTargetNotFound",
          message: "proxy-target header is not found",
          status: 404,
        };
      }
    },
  })
);

app.use(
  (
    err: { code: string; message: string; status: number },
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (err) {
      res.status(err.status).json({ code: err.code, message: err.message });
    }
  }
);

app.listen(port, () => {
  console.log("Proxy listening to port: " + port);
});
