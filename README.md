# ReputaWallet

A tool to check the reputation of Cardano wallet addresses, especially for NFT and OTC traders. Now with AI-powered wallet analysis and advanced Cardano metrics!

## Features

- Check wallet reputation score (0-100)
- Analyze wallet history and activity
- View detailed metrics: age, transaction count, token diversity, NFT activity, staking status, rewards, pool, spam, and more
- AI Analysis: Get a summary and risk assessment from Google Gemini
- Modern, responsive UI (Tailwind CSS + shadcn/ui style)
- Social links and branding
- **Clickable Cardanoscan links** for all address types (wallet, stake, pool)
- **User-friendly scoring**: More fair for Cardano's real-world usage
- **Multi-wallet support**: Connect with Lace, Eternl, Flint, Nami, Typhon, OKX, and more via MeshJS
- **Secure wallet connection**: Wallet connect happens in a popup window for isolation and compatibility

## Prerequisites

- Node.js (v16 or higher recommended)
- npm
- Blockfrost API key ([get one here](https://blockfrost.io))
- Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

## Setup

### 1. Clone the repository

```
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install dependencies

#### Backend (root folder):
```
npm install
npm install @google/genai
```

#### Frontend (client folder):
```
cd client
npm install
npm install lucide-react tailwindcss
```

### 3. Environment variables

Create a `.env` file in the root folder with:
```
PORT=5000
BLOCKFROST_API_KEY=your_blockfrost_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Tailwind CSS (already set up)
- If you add new files/components, make sure to use Tailwind classes for styling.

### 5. Run the app

#### In the root folder, start the backend:
```
npm run dev
```

#### In another terminal, start the frontend:
```
cd client
npm start
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. Click **Connect Wallet**. A popup window will open for you to select and connect your Cardano wallet (Lace, Eternl, Flint, Nami, Typhon, OKX, etc.).
2. After connecting, the popup will close and your wallet address will appear in the main app.
3. Enter any Cardano wallet or stake address, or use your connected address, and click **Check** to analyze the wallet.
4. View the reputation score, detailed metrics, and **AI Analysis**.

## Troubleshooting

- **No wallet options in popup?**
  - Make sure you have a supported Cardano wallet extension installed and enabled (Lace, Eternl, Flint, Nami, Typhon, OKX, etc.).
  - Some extensions may not inject in popups or incognito mode. Try opening the popup in a normal window.
  - If you still see no options, try opening http://localhost:3000/wallet-connect directly in a new tab.

- **Popup does not close or send address?**
  - Make sure you are connecting a wallet with on-chain activity (has received ADA or made a transaction).
  - Some extensions may not expose an address for fresh wallets with 0 balance and no transactions.

- **Failed to check wallet reputation?**
  - This can happen if the wallet address has never been used on-chain. Fund the wallet or use one with at least one transaction.

- **Wallet not detected?**
  - Make sure the extension is enabled for localhost and not restricted.
  - Try a different browser or disable other extensions that may interfere.

## Security
- The app does **not** store your private keys or seed phrases.
- Wallet connection is handled securely via browser extension APIs and MeshJS.

## License
MIT

Any question please contact @Calvith on telegram or gmail dqv12908@gmail.com
