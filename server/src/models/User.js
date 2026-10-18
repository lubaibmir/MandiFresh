import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    googleId: { type: String, unique: true, sparse: true },
    password: { type: String, required: function () { return !this.googleId; } },
    role: { type: String, enum: ['vendor', 'customer'], required: true },
    phone: { type: String, trim: true },
    // vendor only
    shopName: { type: String, trim: true },
    stall: { type: String, trim: true },
    // customer only
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
