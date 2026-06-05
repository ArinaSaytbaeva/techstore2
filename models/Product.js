const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: { type: String, default: '' },  // ← ДОЛЖНО БЫТЬ ЭТО ПОЛЕ
  description: String,
  inStock: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', ProductSchema);