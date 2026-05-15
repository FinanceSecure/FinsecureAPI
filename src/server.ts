import os from 'node:os';
import app from "./app.js";
import { startInvestmentYieldJob } from '@adapters/database/jobs/apply-daily-yield.js';

startInvestmentYieldJob();

const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || "0.0.0.0";

const getNetworkInfo = (address: string) => {
  if (address === "127.0.0.1" || address === "::1")
    return {
      emoji: "💻",
      description: "Localhost (Apenas este PC)"
    };

  if (address.startsWith("192.168.") || address.startsWith("10."))
    return {
      emoji: "📶",
      description: "Rede Local (Wi-Fi/Ethernet)"
    };

  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(address))
    return {
      emoji: "🐳",
      description: "Rede Privada (Docker/Interna)"
    };

  return {
    emoji: "🌐",
    description: "IP Público ou VPN"
  };
};

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });

    console.log(`\n🚀 Server rodando em http://${HOST}:${PORT}`);

    const nets = os.networkInterfaces();

    console.log("\n--- FinanceSecureAPI Status ---");

    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          const address = `http://${net.address}:${PORT}`;
          const { emoji, description } = getNetworkInfo(net.address);

          console.log(`📡 ${address} | ${emoji} ${description}`);
        }
      }
    }

    console.log(`\n📄 Docs: http://localhost:${PORT}/documentation\n`);

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
