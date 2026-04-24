import dotenv from "dotenv";
import Fastify from "fastify";
import { erroMiddleware } from "./adapters/http/middlewares/erroMiddleware.js";
import { registerHttpRoutes } from "./adapters/http/routes/index.js";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

dotenv.config();

const app = Fastify({
  logger: true,
});

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

app.setErrorHandler(erroMiddleware);

await registerHttpRoutes(app);

export default app;
