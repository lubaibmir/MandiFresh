import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Listing from './models/Listing.js';
import Order from './models/Order.js';

await mongoose.connect(process.env.MONGO_URI);
const demo = await User.find({ email: /@mandi\.test$/ }).select('_id');
const ids = demo.map((u) => u._id);
await Promise.all([
  Order.deleteMany({ $or: [{ vendor: { $in: ids } }, { customer: { $in: ids } }] }),
  Listing.deleteMany({ vendor: { $in: ids } }),
  User.deleteMany({ _id: { $in: ids } }),
]);
const password = await bcrypt.hash('password123', 10);

const vendors = await User.insertMany([
  { name: 'Ramesh Patil', email: 'ramesh@mandi.test', role: 'vendor', shopName: 'Patil Fresh Veggies', stall: 'Stall 12, Row B', phone: '9800000001', password },
  { name: 'Sunita Shaikh', email: 'sunita@mandi.test', role: 'vendor', shopName: 'Sunita Greens', stall: 'Stall 4, Row A', phone: '9800000002', password },
  { name: 'Imran Qureshi', email: 'imran@mandi.test', role: 'vendor', shopName: 'Qureshi Brothers', stall: 'Stall 21, Row D', phone: '9800000003', password },
  { name: 'Lakshmi Nair', email: 'lakshmi@mandi.test', role: 'vendor', shopName: 'Lakshmi Farm Basket', stall: 'Stall 9, Row C', phone: '9800000004', password },
]);
await User.create({ name: 'Asha Verma', email: 'asha@mandi.test', role: 'customer', address: 'Flat 302, Sea Breeze Apartments, Bandra, Mumbai', phone: '9800000010', password });

// [name, category, unit, base price]
const catalogue = [
  ['Tomato', 'Everyday', 'kg', 32], ['Onion', 'Everyday', 'kg', 28], ['Potato', 'Everyday', 'kg', 24],
  ['Green Chilli', 'Everyday', 'kg', 70], ['Cauliflower', 'Everyday', 'kg', 45], ['Capsicum', 'Everyday', 'kg', 60],
  ['Spinach', 'Leafy', 'bunch', 15], ['Coriander', 'Leafy', 'bunch', 12], ['Fenugreek', 'Leafy', 'bunch', 14],
  ['Carrot', 'Roots', 'kg', 48], ['Beetroot', 'Roots', 'kg', 36], ['Radish', 'Roots', 'kg', 30],
  ['Bottle Gourd', 'Gourds', 'kg', 26], ['Ridge Gourd', 'Gourds', 'kg', 44], ['Bitter Gourd', 'Gourds', 'kg', 52],
  ['Lemon', 'Fruits', 'dozen', 40], ['Banana', 'Fruits', 'dozen', 55],
];
const listings = [];
vendors.forEach((v, vi) => {
  catalogue.forEach(([name, category, unit, base], ci) => {
    if ((ci + vi) % 5 === 4) return; // each vendor skips a few items
    const wobble = ((ci * 7 + vi * 11) % 9) - 4; // -4..+4
    listings.push({ vendor: v._id, name, nameKey: name.toLowerCase(), category, unit, price: Math.max(5, base + wobble), inStock: true });
  });
});
await Listing.insertMany(listings);
console.log(`Seeded ${vendors.length} vendors, 1 customer, ${listings.length} prices. Password for all: password123`);
await mongoose.disconnect();
