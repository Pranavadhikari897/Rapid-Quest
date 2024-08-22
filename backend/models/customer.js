const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  email: { type: String, required: true },
  first_name: { type: String },
  last_name: { type: String },
  orders_count: { type: Number },
  state: { type: String },
  total_spent: { type: String },
  updated_at: { type: String },
  verified_email: { type: Boolean }
}, { collection: 'shopifyCustomers' });

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
