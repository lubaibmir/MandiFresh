import mongoose from 'mongoose';

export const STATUSES = ['placed', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'];

const itemSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    name: String,
    unit: String,
    price: Number, // price at the time of ordering
    qty: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [itemSchema],
    total: { type: Number, required: true },
    status: { type: String, enum: STATUSES, default: 'placed' },
    address: { type: String, required: true },
    note: String,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
