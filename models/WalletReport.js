const mongoose = require('mongoose');

const walletReportSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        index: true
    },
    reportType: {
        type: String,
        enum: ['scam', 'legit'],
        required: true
    },
    reportedBy: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    }
});

// Create compound index for wallet address and report type
walletReportSchema.index({ walletAddress: 1, reportType: 1 });

const WalletReport = mongoose.model('WalletReport', walletReportSchema);

module.exports = WalletReport; 