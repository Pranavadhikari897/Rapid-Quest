const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  email: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  total_price: { type: String },
  subtotal_price: { type: String },
  total_weight: { type: Number },
  total_tax: { type: String },
  currency: { type: String },
  financial_status: { type: String },
  confirmed: { type: Boolean },
  buyer_accepts_marketing: { type: Boolean },
  name: { type: String }
}, { collection: 'shopifyOrders' });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
