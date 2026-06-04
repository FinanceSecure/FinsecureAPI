import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { erroMiddleware } from "./adapters/http/middlewares/erroMiddleware.js";
import { registerHttpRoutes } from "./adapters/http/routes";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { env } from "@shared/config";

const app = Fastify({
  logger: {
    redact: [
      "req.headers.authorization",
      "req.body.password",
      "req.body.oldPassword",
      "req.body.newPassword",
    ],
  },
});

await app.register(cors, {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origem nao permitida."), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

await app.register(helmet);
await app.register(rateLimit, {
  global: false,
});

if (env.enableSwagger) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Finsecure API",
        description: "API de gestão financeira pessoal e investimentos",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
  });
}

app.setErrorHandler(erroMiddleware);

await registerHttpRoutes(app);

export default app;
