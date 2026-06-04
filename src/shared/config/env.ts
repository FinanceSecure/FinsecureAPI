import "dotenv/config";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

function parseCorsOrigins(value: string | undefined) {
  const origins = (value ?? requireEnv("CORS_ORIGINS"))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("CORS_ORIGINS deve possuir ao menos uma origem valida.");
  }

  return origins;
}

function parseBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
}

const jwtSecret = requireEnv("JWT_SECRET");

if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET deve possuir pelo menos 32 caracteres.");
}

function parsePositiveNumber(name: string, defaultValue: number) {
  const value = Number(process.env[name] ?? defaultValue);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} deve ser um numero maior que zero.`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret,
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  port: Number(process.env.PORT) || 3333,
  host: process.env.HOST || "0.0.0.0",
  annualCdi: parsePositiveNumber("CDI_ANUAL", 14.4),
  dailyCdi: parsePositiveNumber("CDI_DIARIO", 0.000534),
  enableSwagger: parseBoolean(
    process.env.ENABLE_SWAGGER,
    (process.env.NODE_ENV ?? "development") !== "production"
  ),
  runInvestmentYieldJob: parseBoolean(
    process.env.RUN_INVESTMENT_YIELD_JOB,
    false
  ),
};
