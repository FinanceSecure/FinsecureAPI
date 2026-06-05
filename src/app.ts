import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { erroMiddleware } from "./adapters/http/middlewares/erroMiddleware.js";
import { registerHttpRoutes } from "./adapters/http/routes";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { env } from "@shared/config";

const redactedLoggerFields: string[] = [
  "req.headers.authorization",
  "req.body.password",
  "req.body.oldPassword",
  "req.body.newPassword",
];

export type AppRuntimeConfig = {
  corsOrigins: string[];
  disableRequestLogging: boolean;
  enableSwagger: boolean;
  logLevel: "info" | "error";
};

export const defaultAppRuntimeConfig: AppRuntimeConfig = {
  corsOrigins: env.corsOrigins,
  disableRequestLogging: env.nodeEnv === "production",
  enableSwagger: env.enableSwagger,
  logLevel: env.nodeEnv === "production" ? "error" : "info",
};

export async function buildApp(
  config: AppRuntimeConfig = defaultAppRuntimeConfig
): Promise<FastifyInstance> {
  const app: FastifyInstance = Fastify({
    trustProxy: true,
    disableRequestLogging: config.disableRequestLogging,
    logger: {
      level: config.logLevel,
      redact: redactedLoggerFields,
    },
  });

  await app.register(cors, {
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
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

  if (config.enableSwagger) {
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

  return app;
}

const app = await buildApp();

export default app;
