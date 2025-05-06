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

1. Enter a Cardano wallet or stake address.
2. Click "Check" to analyze the wallet.
3. View the reputation score, detailed metrics, and **AI Analysis**.
4. Click on any address, stake key, or pool to view it on Cardanoscan.
5. Use the social links to connect or view the project.

## Metrics & Scoring
- **Advanced metrics:** Staking status, rewards, pool, spam, activity, and more.
- **User-friendly scoring:** More fair for Cardano's real-world usage (see Score Breakdown in the app).
- **All links** (wallet, stake, pool) are clickable and open Cardanoscan for easy verification.

## AI Analysis
- The backend uses Google Gemini to provide a risk summary and insight for each wallet.
- Make sure your Gemini API key is valid and you have not exceeded your quota.

## Note
- The reputation score is an automated assessment for OTC trustworthiness only. It does not reflect personal reputation or serve to defame any individual or entity.

## Customization
- Place your logo at `client/public/logo.png`.
- Edit project name/slogan in `client/src/App.js` if needed.

## Contributing
Feel free to submit issues and enhancement requests!

## License
MIT

Any question please contact @Calvith on telegram or gmail dqv12908@gmail.com