const feePaymentSchema = new mongoose.Schema({

    voucherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeVoucher",
        required: true
    },

    amount: Number,

    paymentMode: {
        type: String,
        enum: ["cash", "online", "bank"]
    },

    receivedBy: String,
    platform: String,
    transactionId: String,

    receivedDate: {
        type: Date,
        default: Date.now
    }

});
