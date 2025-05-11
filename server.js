require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// JSON file for storing reports
const REPORTS_FILE = path.join(__dirname, 'walletReports.json');

function readReports() {
  if (!fs.existsSync(REPORTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
}

function writeReports(reports) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf8');
}

// Middleware
app.use(cors());
app.use(express.json());

// Blockfrost API configuration
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY;
const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper: Check if input is a stake address
const isStakeAddress = (address) => address.startsWith('stake');

// Helper: Convert block_time (unix) to JS Date
const unixToDate = (unix) => new Date(unix * 1000);

// Helper functions for reputation scoring
const calculateAgeScore = (firstTransactionDate) => {
    const ageInDays = (new Date() - new Date(firstTransactionDate)) / (1000 * 60 * 60 * 24);
    if (ageInDays > 365) return 20;
    if (ageInDays > 90) return 10;
    if (ageInDays < 7) return -20;
    return 0;
};

// Loosened scoring for Cardano
const calculateTransactionScore = (transactionCount) => {
    if (transactionCount > 10000) return 20;
    if (transactionCount > 1000) return 15;
    if (transactionCount > 100) return 10;
    if (transactionCount > 10) return 5;
    return 0;
};

const calculateTokenDiversityScore = (tokenCount) => {
    if (tokenCount > 100) return 10;
    if (tokenCount > 20) return 7;
    if (tokenCount > 5) return 5;
    if (tokenCount >= 2) return 2;
    return 0;
};

const calculateNFTActivityScore = (nftCount) => {
    if (nftCount > 100) return 10;
    if (nftCount > 20) return 7;
    if (nftCount > 5) return 5;
    if (nftCount > 1) return 2;
    return 0;
};

// Advanced scoring helpers
function calculateStakingScore(accountInfo) {
  if (!accountInfo) return 0;
  if (accountInfo.active) return 10;
  if (accountInfo.active_epoch) return 5;
  return 0;
}
function calculateRewardScore(accountInfo) {
  const rewards = parseInt(accountInfo?.rewards_sum || '0') / 1e6;
  if (rewards > 100) return 5;
  if (rewards > 10) return 2;
  return 0;
}
function calculateSpamScore(assetCount, mintCount) {
    if (assetCount > 1000) return -20;
    if (assetCount > 500) return -10;
    return 0;
}
function calculateActivityScore(txCount, firstTxTime) {
  if (txCount > 0 && firstTxTime) {
    const days = (new Date() - new Date(firstTxTime * 1000)) / (1000 * 60 * 60 * 24);
    const freq = txCount / days;
    if (freq > 0.5 && freq < 10) return 5; // Giao dịch đều đặn
    if (freq >= 10) return -5; // Có thể là spam
  }
  return 0;
}

// AI Insight function using Gemini
async function getAIInsight(walletStats, recentTransactions) {
    if (!GEMINI_API_KEY) return null;
    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const model = 'gemini-1.5-flash';
        const prompt = `You are an expert in blockchain analysis and Cardano wallet safety.\n\nAnalyze the following Cardano wallet data and provide a concise risk assessment and summary for NFT and OTC trading safety. Highlight any suspicious patterns, spam, or scam risks, and mention if the wallet appears trustworthy or not. If possible, suggest what a user should be careful about.\n\nWallet statistics:\n${JSON.stringify(walletStats, null, 2)}\n\nRecent transactions (showing up to 10):\n${JSON.stringify(recentTransactions.slice(0, 10), null, 2)}\n\nRespond in 2-3 sentences, in clear, non-technical language for regular users.`;
        const contents = [
            {
                role: 'user',
                parts: [ { text: prompt } ]
            }
        ];
        const response = await ai.models.generateContent({
            model,
            contents,
        });
        if (
            response &&
            response.candidates &&
            response.candidates[0] &&
            response.candidates[0].content &&
            response.candidates[0].content.parts &&
            response.candidates[0].content.parts[0].text
        ) {
            return response.candidates[0].content.parts[0].text;
        }
        return null;
    } catch (err) {
        console.error('Gemini AI error:', err.message);
        return null;
    }
}

// Helper: classify wallet type
function classifyWalletType(addressInfo, txCount, isStakeAddr) {
  if (isStakeAddr) return 'Stake Wallet';
  if (!addressInfo) return 'Unknown';
  if (addressInfo.type === 'stake') return 'Stake Wallet';
  if (addressInfo.type === 'enterprise') return 'Enterprise Wallet';
  if (addressInfo.type === 'script') return 'Script Wallet';
  if (txCount === 0) return 'Fresh Wallet';
  return 'Normal Wallet';
}

// Main endpoint for wallet reputation check
app.post('/api/check-reputation', async (req, res) => {
    try {
        let { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        // Get report information from JSON file
        const allReports = readReports().filter(r => r.walletAddress === walletAddress);
        const scamCount = allReports.filter(r => r.reportType === 'scam').length;
        const legitCount = allReports.filter(r => r.reportType === 'legit').length;
        const reportSummary = { scam: scamCount, legit: legitCount };

        let stakeAddress = walletAddress;
        let addresses = [];
        let mainAddressInfo = null;
        let isStakeAddr = isStakeAddress(walletAddress);
        let allTxs = [];
        let allAssets = new Set();
        let allNFTs = new Set();
        let firstTxTime = null;
        let totalBalance = 0;
        let totalTxCount = 0;
        let walletType = 'Unknown';
        let accountInfo = null;
        let mintCount = 0;
        let stakingScore = 0;
        let rewardScore = 0;
        let spamScore = 0;
        let activityScore = 0;

        if (isStakeAddr) {
            // Lấy tổng quan từ accounts API
            let accountInfoResp;
            try {
                accountInfoResp = await axios.get(
                    `${BLOCKFROST_URL}/accounts/${stakeAddress}`,
                    { headers: { 'project_id': BLOCKFROST_API_KEY } }
                );
            } catch (err) {
                return res.status(404).json({ error: 'This is a stake account (starts with stake), but not found on chain.' });
            }
            accountInfo = accountInfoResp.data;
            // Lấy giao dịch từ accounts API (chỉ fetch 100 để AI phân tích, nhưng dùng tx_count cho scoring)
            const txsResp = await axios.get(
                `${BLOCKFROST_URL}/accounts/${stakeAddress}/transactions?order=asc&count=100`,
                { headers: { 'project_id': BLOCKFROST_API_KEY } }
            );
            allTxs = txsResp.data;
            totalBalance = parseInt(accountInfo.controlled_amount || '0');
            totalTxCount = accountInfo.tx_count || allTxs.length;
            // Lấy các địa chỉ liên kết để lấy assets/NFTs
            const addressesResp = await axios.get(
                `${BLOCKFROST_URL}/accounts/${stakeAddress}/addresses`,
                { headers: { 'project_id': BLOCKFROST_API_KEY } }
            );
            addresses = addressesResp.data.map(a => a.address);
            for (const addr of addresses) {
                const addrInfo = await axios.get(
                    `${BLOCKFROST_URL}/addresses/${addr}`,
                    { headers: { 'project_id': BLOCKFROST_API_KEY } }
                );
                for (const amt of addrInfo.data.amount) {
                    if (amt.unit !== 'lovelace') {
                        allAssets.add(amt.unit);
                        if (amt.quantity === '1') allNFTs.add(amt.unit);
                    }
                }
            }
            // Lấy thời gian giao dịch đầu tiên nếu có
            if (allTxs.length > 0) {
                firstTxTime = allTxs[0].block_time;
            }
            // Lấy số asset mint (nếu cần)
            const mintsResp = await axios.get(
                `${BLOCKFROST_URL}/accounts/${stakeAddress}/addresses/assets`,
                { headers: { 'project_id': BLOCKFROST_API_KEY } }
            ).catch(() => ({ data: [] }));
            mintCount = mintsResp.data.length || 0;
            walletType = 'Stake Wallet';
        } else {
            // Address thường
            const addressInfoResp = await axios.get(
                `${BLOCKFROST_URL}/addresses/${walletAddress}`,
                { headers: { 'project_id': BLOCKFROST_API_KEY } }
            );
            mainAddressInfo = addressInfoResp.data;
            stakeAddress = mainAddressInfo.stake_address;
            // Nếu có stake_address, fetch account info
            if (stakeAddress) {
                let accountInfoResp;
                try {
                    accountInfoResp = await axios.get(
                        `${BLOCKFROST_URL}/accounts/${stakeAddress}`,
                        { headers: { 'project_id': BLOCKFROST_API_KEY } }
                    );
                    accountInfo = accountInfoResp.data;
                } catch (err) {
                    accountInfo = null;
                }
            }
            // Lấy giao dịch
            const txResp = await axios.get(
                `${BLOCKFROST_URL}/addresses/${walletAddress}/transactions?order=asc&count=100`,
                { headers: { 'project_id': BLOCKFROST_API_KEY } }
            );
            allTxs = txResp.data;
            totalTxCount = allTxs.length;
            // Lấy balance
            for (const amt of mainAddressInfo.amount) {
                if (amt.unit === 'lovelace') {
                    totalBalance += parseInt(amt.quantity);
                } else {
                    allAssets.add(amt.unit);
                    if (amt.quantity === '1') allNFTs.add(amt.unit);
                }
            }
            if (allTxs.length > 0) {
                firstTxTime = allTxs[0].block_time;
            }
            // Nếu có stake_address, dùng info từ accountInfo để hiển thị và tính điểm
            if (accountInfo) {
                // Gộp thêm asset/NFT từ các địa chỉ liên kết nếu muốn
                totalBalance = parseInt(accountInfo.controlled_amount || totalBalance);
                totalTxCount = accountInfo.tx_count || totalTxCount;
                // Lấy số asset mint (nếu cần)
                const mintsResp = await axios.get(
                    `${BLOCKFROST_URL}/accounts/${stakeAddress}/addresses/assets`,
                    { headers: { 'project_id': BLOCKFROST_API_KEY } }
                ).catch(() => ({ data: [] }));
                mintCount = mintsResp.data.length || 0;
                walletType = 'Stake Wallet';
            } else {
                walletType = classifyWalletType(mainAddressInfo, totalTxCount, false);
            }
        }

        // Remove duplicate txs (by tx_hash)
        const uniqueTxs = Array.from(new Set(allTxs.map(tx => tx.tx_hash))).map(
            hash => allTxs.find(tx => tx.tx_hash === hash)
        );

        // Calculate scores
        const ageScore = firstTxTime ? calculateAgeScore(unixToDate(firstTxTime)) : 0;
        const transactionScore = calculateTransactionScore(totalTxCount);
        const tokenDiversityScore = calculateTokenDiversityScore(allAssets.size);
        const nftActivityScore = calculateNFTActivityScore(allNFTs.size);
        stakingScore = calculateStakingScore(accountInfo);
        rewardScore = calculateRewardScore(accountInfo);
        spamScore = calculateSpamScore(allAssets.size, mintCount);
        activityScore = calculateActivityScore(totalTxCount, firstTxTime);

        const walletStats = {
            ageScore,
            transactionScore,
            tokenDiversityScore,
            nftActivityScore,
            stakingScore,
            rewardScore,
            spamScore,
            activityScore,
            totalTransactions: totalTxCount,
            totalAssets: allAssets.size,
            totalNFTs: allNFTs.size,
            firstTransaction: firstTxTime ? unixToDate(firstTxTime) : null,
            currentBalance: totalBalance / 1000000, // ADA
            rewardsSum: accountInfo?.rewards_sum ? parseInt(accountInfo.rewards_sum) / 1e6 : undefined,
            withdrawalsSum: accountInfo?.withdrawals_sum ? parseInt(accountInfo.withdrawals_sum) / 1e6 : undefined,
            poolId: accountInfo?.pool_id,
            isStaking: accountInfo?.active,
        };

        // AI insight
        const aiInsight = await getAIInsight(walletStats, uniqueTxs);

        const totalScore = Math.max(0, Math.min(100,
            ageScore +
            transactionScore +
            tokenDiversityScore +
            nftActivityScore +
            stakingScore +
            rewardScore +
            spamScore +
            activityScore
        ));

        let reputationLevel = '';
        if (totalScore >= 80) reputationLevel = 'Very Trustworthy ✅';
        else if (totalScore >= 50) reputationLevel = 'Trustworthy ☑️';
        else if (totalScore >= 20) reputationLevel = 'Average ⚠️';
        else reputationLevel = 'High Risk 🔴';

        const response = {
            input: walletAddress,
            stakeAddress,
            reputationScore: totalScore,
            reputationLevel,
            walletType,
            metrics: walletStats,
            aiInsight,
            reports: reportSummary
        };
        res.json(response);
    } catch (error) {
        console.error('Error checking wallet reputation:', error?.response?.data || error.message);
        res.status(500).json({ error: 'Failed to check wallet reputation' });
    }
});

// New endpoint for reporting a wallet (JSON file version)
app.post('/api/report-wallet', (req, res) => {
    const { walletAddress, reportType, reportedBy, description } = req.body;

    if (!walletAddress || !reportType || !reportedBy || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (!['scam', 'legit'].includes(reportType)) {
        return res.status(400).json({ error: 'Invalid report type' });
    }

    const reports = readReports();
    reports.push({
        walletAddress,
        reportType,
        reportedBy,
        description,
        timestamp: new Date().toISOString()
    });
    writeReports(reports);

    res.json({ message: 'Report submitted successfully' });
});

// New endpoint for getting wallet reports (JSON file version)
app.get('/api/wallet-reports/:walletAddress', (req, res) => {
    const { walletAddress } = req.params;
    const reports = readReports().filter(r => r.walletAddress === walletAddress);

    const scamReports = reports.filter(r => r.reportType === 'scam');
    const legitReports = reports.filter(r => r.reportType === 'legit');

    res.json({
        scam: { count: scamReports.length, reports: scamReports },
        legit: { count: legitReports.length, reports: legitReports }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 