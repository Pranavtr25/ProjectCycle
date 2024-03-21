const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'user' },
    wishlistProducts: [
        {
            productId: { type: mongoose.Types.ObjectId, required: true, ref: 'products' }
        }
    ],
}, { strictPopulate: false });


module.exports = mongoose.model("wishlist", wishlistSchema);