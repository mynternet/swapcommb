const mongoose = require('mongoose');

const swapTransactionSchema = new mongoose.Schema({
  itemOffered: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemRequested: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  offeredByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] },
  transactionDate: { type: Date, default: Date.now },
});

const SwapTransaction = mongoose.model('SwapTransaction', swapTransactionSchema);

module.exports = SwapTransaction;
