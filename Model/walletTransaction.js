import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
    transactionId: { type: String, required: true, unique: true }, // Unique transaction ID
    type: { type: String, enum: ["credit", "debit"], required: true }, // Credit for deposit, Debit for spending
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} },
});

const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);

export default WalletTransaction