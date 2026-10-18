import mongoose from 'mongoose';

export const CATEGORIES = ['Everyday', 'Leafy', 'Roots', 'Gourds', 'Fruits'];
export const UNITS = ['kg', 'bunch', 'dozen', 'piece'];

// One vegetable at one price from one vendor.
const listingSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    nameKey: { type: String, required: true, index: true }, // lowercase; groups the same vegetable across vendors
    category: { type: String, enum: CATEGORIES, default: 'Everyday' },
    unit: { type: String, enum: UNITS, default: 'kg' },
    price: { type: Number, required: true, min: 0 },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

listingSchema.index({ vendor: 1, nameKey: 1 }, { unique: true });

export default mongoose.model('Listing', listingSchema);
