const mongoose = require("mongoose")

const walletSchema= new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref:'users'},
    walletBalance: { type: Number, default: 0 },
    walletCreditTransaction: [
        {
            transactionDate: { type: Date, default : new Date()  },
            transactionAmount: { type: Number },
            transactionType: { type: String },
            message : { type : String }
        }
    ],
    walletDebitTransaction:[
        {
            transactionDate: { type: Date, default : new Date()  },
            transactionAmount: { type: Number },
            transactionType: { type: String ,enum : ['Wallet']},
            message : { type : String }
        }
    ]
})


module.exports = mongoose.model("Wallet", walletSchema);