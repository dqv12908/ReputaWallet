import React, { useState } from 'react';
import axios from 'axios';
import { Github, Facebook, Twitter, Send, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-blue-600';
  if (score >= 20) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBadge(score) {
  if (score >= 80) return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold"><ShieldCheck className="w-4 h-4" />Very Trustworthy</span>;
  if (score >= 50) return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold"><ShieldCheck className="w-4 h-4" />Trustworthy</span>;
  if (score >= 20) return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold"><AlertTriangle className="w-4 h-4" />Average</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold"><XCircle className="w-4 h-4" />High Risk</span>;
}

export default function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleCheckReputation = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post('http://localhost:5000/api/check-reputation', {
        walletAddress,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check wallet reputation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="ReputaWallet Logo" className="w-28 h-28 mb-2 shadow" />
          <h1 className="text-3xl font-extrabold text-center text-blue-700 tracking-tight">ReputaWallet</h1>
          <div className="text-center text-slate-600 text-base mt-1 font-medium max-w-md">Your fast, simple tool to assess the reputation of Cardano wallets for safer NFT and OTC trading.</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg bg-white"
            placeholder="Enter Cardano Wallet or Stake Address"
            value={walletAddress}
            onChange={e => setWalletAddress(e.target.value)}
            disabled={loading}
          />
          <button
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleCheckReputation}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              'Check'
            )}
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-center">
            {error}
          </div>
        )}
        {result && (
          <>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 shadow p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                <div>
                  <div className="text-lg font-bold text-slate-700 mb-1 uppercase tracking-wide">Reputation Score</div>
                  <div className="flex items-center gap-3">
                    <span className={`text-5xl font-extrabold ${getScoreColor(result.reputationScore)}`}>{result.reputationScore}</span>
                    {getScoreBadge(result.reputationScore)}
                  </div>
                  <div className="mt-2 text-base text-slate-600">Wallet Type: <span className="font-bold text-blue-700">{result.walletType}</span></div>
                </div>
                <div className="text-xs text-slate-500 break-all text-right mt-4 sm:mt-0">
                  <div className="font-semibold text-slate-700">Stake Address:</div>
                  {result.stakeAddress ? (
                    <a
                      href={`https://cardanoscan.io/stakeKey/${result.stakeAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-700 underline hover:text-blue-900"
                    >
                      {result.stakeAddress}
                    </a>
                  ) : (
                    <span className="font-mono">N/A</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/80 rounded-xl p-4 border border-slate-100 mb-2">
                  <div className="font-semibold text-slate-700 mb-2 text-base">Wallet Metrics</div>
                  <div className="text-slate-600">Total Transactions: <span className="font-mono font-bold text-blue-800">{result.metrics.totalTransactions}</span></div>
                  <div className="text-slate-600">Total Assets: <span className="font-mono font-bold text-purple-700">{result.metrics.totalAssets}</span></div>
                  <div className="text-slate-600">Total NFTs: <span className="font-mono font-bold text-purple-700">{result.metrics.totalNFTs}</span></div>
                  <div className="text-slate-600">Current Balance: <span className="font-mono font-bold text-green-700">{result.metrics.currentBalance} ADA</span></div>
                  <div className="text-slate-600">First Transaction: <span className="font-mono">{result.metrics.firstTransaction ? new Date(result.metrics.firstTransaction).toLocaleDateString() : 'N/A'}</span></div>
                  <div className="text-slate-600">Staking: <span className="font-bold">{result.metrics.isStaking ? 'Yes' : 'No'}</span></div>
                  <div className="text-slate-600">Staking Pool: <span className="font-mono">
                    {result.metrics.poolId ? (
                      <a
                        href={`https://cardanoscan.io/pool/${result.metrics.poolId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline hover:text-blue-900 break-all"
                        title={result.metrics.poolId}
                      >
                        {result.metrics.poolId.slice(0, 8) + '...' + result.metrics.poolId.slice(-6)}
                      </a>
                    ) : 'N/A'}
                  </span></div>
                  <div className="text-slate-600">Total Rewards: <span className="font-mono font-bold text-green-700">{result.metrics.rewardsSum ?? 'N/A'} ADA</span></div>
                  <div className="text-slate-600">Total Withdrawals: <span className="font-mono font-bold text-green-700">{result.metrics.withdrawalsSum ?? 'N/A'} ADA</span></div>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-slate-100 mb-2">
                  <div className="font-semibold text-slate-700 mb-2 text-base">Score Breakdown</div>
                  <div className="text-slate-600">Age Score: <span className="font-bold">{result.metrics.ageScore}</span></div>
                  <div className="text-slate-600">Transaction Score: <span className="font-bold">{result.metrics.transactionScore}</span></div>
                  <div className="text-slate-600">Token Diversity Score: <span className="font-bold">{result.metrics.tokenDiversityScore}</span></div>
                  <div className="text-slate-600">NFT Activity Score: <span className="font-bold">{result.metrics.nftActivityScore}</span></div>
                  <div className="text-slate-600">Staking Score: <span className="font-bold">{result.metrics.stakingScore}</span></div>
                  <div className="text-slate-600">Reward Score: <span className="font-bold">{result.metrics.rewardScore}</span></div>
                  <div className="text-slate-600">Spam Score: <span className="font-bold">{result.metrics.spamScore}</span></div>
                  <div className="text-slate-600">Activity Score: <span className="font-bold">{result.metrics.activityScore}</span></div>
                </div>
              </div>
            </div>
            {/* NOTE: Reputation disclaimer */}
            <div className="mt-2 mb-4 text-xs text-slate-500 text-center italic">
              Note: The reputation score is an automated assessment for OTC trustworthiness only. It does not reflect personal reputation or serve to defame any individual or entity.
            </div>
            {result.aiInsight && (
              <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl shadow">
                <div className="font-bold text-blue-700 mb-2 text-lg uppercase tracking-wide">AI Analysis</div>
                <div className="text-slate-800 text-base whitespace-pre-line">{result.aiInsight}</div>
              </div>
            )}
          </>
        )}
        <div className="mt-8 text-center text-xs text-slate-400">
          Powered by <a href="https://blockfrost.io/" className="underline hover:text-blue-600">Blockfrost API</a> &bull; Cardano Reputation Checker &bull; <a href={`https://cardanoscan.io/address/${result?.input || ''}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">View on Cardanoscan</a>
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <a href="https://t.me/calvith" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 border border-slate-200 transition">
            <Send className="w-5 h-5 text-blue-500 group-hover:text-blue-700" />
            <span className="font-medium text-slate-700">Telegram</span>
          </a>
          <a href="https://x.com/Calvith_tarn" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 border border-slate-200 transition">
            <Twitter className="w-5 h-5 text-blue-400 group-hover:text-blue-600" />
            <span className="font-medium text-slate-700">Twitter</span>
          </a>
          <a href="https://www.facebook.com/profile.php?id=100057550347059" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 border border-slate-200 transition">
            <Facebook className="w-5 h-5 text-blue-600 group-hover:text-blue-800" />
            <span className="font-medium text-slate-700">Facebook</span>
          </a>
          <a href="https://github.com/dqv12908/ReputaWallet" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-100 border border-slate-200 transition">
            <Github className="w-5 h-5 text-slate-800 group-hover:text-black" />
            <span className="font-medium text-slate-700">GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
} 