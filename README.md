# checkout-crypto

Checkout simples para receber pagamentos em USDC/USDT (Ethereum, Polygon, Arbitrum, Base)  
Backend em Node.js + Express + ethers.

## Visão geral
Este projeto expõe duas rotas principais:
- `POST /api/convert` — converte um valor USD para token (USDC/USDT). Usa CoinGecko.
- `POST /api/verify` — verifica uma transação enviada pelo cliente (confirma token, destinatário).

> Arquivo principal: `index.js`

## Pré-requisitos
- Node.js 18+ (recomendado)
- npm ou yarn
- Conta GitHub
- Conta em um serviço de deploy (Render / Railway / Vercel) — recomendo Render ou Railway para rodar um servidor Express.

## Instalação local
1. Clone o repositório:
```bash
git clone https://github.com/GabrielPauloASilva/checkout-crypto.git
cd checkout-crypto
Instale dependências:

bash
Copiar código
npm install
# ou
yarn
Crie um .env (faça copy de .env.example):

bash
Copiar código
cp .env.example .env
# edite .env com seu editor
Rodar localmente:

bash
Copiar código
npm start
# ou
node index.js
