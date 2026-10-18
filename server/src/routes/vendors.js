import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

const router = Router();
const vendorFields = 'shopName stall name phone';

router.get('/', async (_req, res, next) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select(vendorFields).lean();
    const counts = await Listing.aggregate([
      { $match: { inStock: true } },
      { $group: { _id: '$vendor', items: { $sum: 1 }, updatedAt: { $max: '$updatedAt' } } },
    ]);
    const byVendor = Object.fromEntries(counts.map((c) => [String(c._id), c]));
    res.json(
      vendors
        .map((v) => ({ ...v, items: byVendor[String(v._id)]?.items || 0, updatedAt: byVendor[String(v._id)]?.updatedAt || null }))
        .sort((a, b) => b.items - a.items)
    );
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Vendor not found' });
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' }).select(vendorFields).lean();
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const listings = await Listing.find({ vendor: vendor._id }).sort('name').lean();
    res.json({ vendor, listings });
  } catch (e) { next(e); }
});

export default router;
