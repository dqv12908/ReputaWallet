import React, { useState } from 'react';
import api from '../api';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, walletAddress }) {
  const [reportType, setReportType] = useState('scam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/api/report-wallet', {
        walletAddress,
        reportType,
        reportedBy: 'anonymous',
        description,
      });
      setSuccess(true);
      setDescription('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            {reportType === 'scam' ? 'Report Scam Wallet' : 'Verify Legitimate Wallet'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-200">
            Report submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Report Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="scam"
                  checked={reportType === 'scam'}
                  onChange={(e) => setReportType(e.target.value)}
                  className="text-blue-600"
                />
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  Scam
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="legit"
                  checked={reportType === 'legit'}
                  onChange={(e) => setReportType(e.target.value)}
                  className="text-blue-600"
                />
                <span className="flex items-center gap-1 text-green-600">
                  <ShieldCheck className="w-4 h-4" />
                  Legitimate
                </span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder={`Please describe why you think this wallet is ${reportType === 'scam' ? 'a scam' : 'legitimate'}...`}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white font-medium ${
                reportType === 'scam'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-60`}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 