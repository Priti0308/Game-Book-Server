const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., 'customerSrNo_5f8d0a7c7f8b9a2b1c3d4e5f'
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", counterSchema);
