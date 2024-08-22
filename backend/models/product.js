const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String },
  handle: { type: String },
  product_type: { type: String },
  vendor: { type: String },
  created_at: { type: Date },
  updated_at: { type: Date }
}, { collection: 'shopifyProducts' }); 

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
