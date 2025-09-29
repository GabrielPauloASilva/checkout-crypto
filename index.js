import express from "express";
import fetch from "node-fetch";
import { ethers } from "ethers";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // ✅ carrega variáveis do .env

const app = express();
app.use(express.json());

// habilita CORS apenas para sua loja
app.use(cors({
  origin: [
    "https://sualoja.myshopify.com",
    "https://www.sualoja.myshopify.com"
  ]
}));

// ⚙️ Configurações
const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS; 
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_STORE = process.env.SHOPIFY_STORE; 


// RPCs grátis para múltiplas redes
const RPCS = {
  ethereum: "https://eth.llamarpc.com",
  polygon: "https://polygon.llamarpc.com",
  arbitrum: "https://arbitrum.llamarpc.com",
  base: "https://base.llamarpc.com"
};

// Contratos USDC/USDT
const TOKENS = {
  ethereum: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  },
  polygon: {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AaCb4FE739a"
  },
  arbitrum: {
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
  },
  base: {
    USDC: "0x833589fCD6EDb6E08f4c7C32D4f71b54BDA02913" // só USDC
  }
};

// 📌 Rota para converter preço em USD -> token
app.post("/api/convert", async (req, res) => {
  const { usdAmount } = req.body;

  try {
    const prices = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether,usd-coin&vs_currencies=usd")
      .then(r => r.json());

    // Como USDT e USDC ≈ 1 USD, mantemos simples
    res.json({
      USDC: usdAmount,
      USDT: usdAmount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar preços" });
  }
});

// 📌 Rota para verificar transação
app.post("/api/verify", async (req, res) => {
  const { txHash, network, token } = req.body;

  try {
    const provider = new ethers.JsonRpcProvider(RPCS[network]);
    const tx = await provider.getTransaction(txHash);
    await tx.wait(); // aguardar confirmação

    // Verifica destinatário
    if (tx.to.toLowerCase() !== TOKENS[network][token].toLowerCase()) {
      return res.status(400).json({ error: "Token incorreto" });
    }

    // Verifica quem recebeu (MERCHANT_ADDRESS)
    // Para tokens ERC-20 precisamos decodificar o `transfer()`
    const iface = new ethers.Interface([
      "function transfer(address to, uint256 value)"
    ]);
    const decoded = iface.decodeFunctionData("transfer", tx.data);

    if (decoded[0].toLowerCase() !== MERCHANT_ADDRESS.toLowerCase()) {
      return res.status(400).json({ error: "Pagamento não foi para o comerciante" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao verificar transação" });
  }
});


// quando roda local
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => console.log("Backend rodando na porta 3000"));
}

export default app; // ✅ para Vercel
