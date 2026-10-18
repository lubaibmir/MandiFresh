import { Router } from 'express';
import Listing, { CATEGORIES, UNITS } from '../models/Listing.js';
import { auth } from '../middleware/auth.js';

// ---------- Public: produce grouped by vegetable, for comparing vendors ----------
export const produceRouter = Router();

produceRouter.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = { inStock: true };
    if (category && CATEGORIES.includes(category)) filter.category = category;
    if (search) filter.nameKey = { $regex: String(search).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') };

    const listings = await Listing.find(filter).lean();
    const groups = new Map();
    for (const l of listings) {
      const g = groups.get(l.nameKey) || { key: l.nameKey, name: l.name, category: l.category, unit: l.unit, min: Infinity, max: 0, vendors: 0, updatedAt: l.updatedAt };
      g.min = Math.min(g.min, l.price);
      g.max = Math.max(g.max, l.price);
      g.vendors += 1;
      if (l.updatedAt > g.updatedAt) g.updatedAt = l.updatedAt;
      groups.set(l.nameKey, g);
    }
    res.json([...groups.values()].sort((a, b) => a.name.localeCompare(b.name)));
  } catch (e) { next(e); }
});

produceRouter.get('/:key', async (req, res, next) => {
  try {
    const listings = await Listing.find({ nameKey: req.params.key.toLowerCase(), inStock: true })
      .populate('vendor', 'shopName stall name')
      .sort('price')
      .lean();
    if (!listings.length) return res.status(404).json({ message: 'Nobody is selling this right now' });
    const first = listings[0];
    res.json({
      key: first.nameKey,
      name: first.name,
      category: first.category,
      offers: listings.map((l) => ({
        listingId: l._id, price: l.price, unit: l.unit, updatedAt: l.updatedAt,
        vendor: { id: l.vendor._id, shopName: l.vendor.shopName, stall: l.vendor.stall },
      })),
    });
  } catch (e) { next(e); }
});

// ---------- Vendor: manage own price list ----------
const router = Router();
router.use(auth('vendor'));

router.get('/mine', async (req, res, next) => {
  try { res.json(await Listing.find({ vendor: req.user._id }).sort('name').lean()); } catch (e) { next(e); }
});

// Add a vegetable, or update it if this vendor already lists it.
router.post('/', async (req, res, next) => {
  try {
    const { name, category, unit, price } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Vegetable name is required' });
    const p = Number(price);
    if (price === '' || !Number.isFinite(p) || p < 0) return res.status(400).json({ message: 'Enter a valid price' });
    if (unit && !UNITS.includes(unit)) return res.status(400).json({ message: 'Invalid unit' });
    if (category && !CATEGORIES.includes(category)) return res.status(400).json({ message: 'Invalid category' });
    const nameKey = name.trim().toLowerCase();
    const listing = await Listing.findOneAndUpdate(
      { vendor: req.user._id, nameKey },
      { $set: { name: name.trim(), price: p, inStock: true, ...(category && { category }), ...(unit && { unit }) } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(201).json(listing);
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const update = {};
    if (req.body.price !== undefined) {
      const p = Number(req.body.price);
      if (req.body.price === '' || !Number.isFinite(p) || p < 0) return res.status(400).json({ message: 'Enter a valid price' });
      update.price = p;
    }
    if (req.body.inStock !== undefined) update.inStock = !!req.body.inStock;
    if (req.body.unit && UNITS.includes(req.body.unit)) update.unit = req.body.unit;
    const listing = await Listing.findOneAndUpdate({ _id: req.params.id, vendor: req.user._id }, update, { new: true });
    if (!listing) return res.status(404).json({ message: 'Item not found' });
    res.json(listing);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const r = await Listing.deleteOne({ _id: req.params.id, vendor: req.user._id });
    if (!r.deletedCount) return res.status(404).json({ message: 'Item not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
