import { Router } from 'express';
import Listing from '../models/Listing.js';
import Order, { STATUSES } from '../models/Order.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Customer places one cart; it is split into one order per vendor.
router.post('/', auth('customer'), async (req, res, next) => {
  try {
    const { items, address, note } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Your cart is empty' });
    if (!address?.trim()) return res.status(400).json({ message: 'Add a delivery address' });

    const qtyById = new Map();
    for (const i of items) {
      const q = Number(i.qty);
      if (!i.listingId || !Number.isFinite(q) || q <= 0 || q > 100) return res.status(400).json({ message: 'Invalid quantity in cart' });
      qtyById.set(String(i.listingId), (qtyById.get(String(i.listingId)) || 0) + q);
    }

    // Always use the current price from the database, never the client's.
    const listings = await Listing.find({ _id: { $in: [...qtyById.keys()] } });
    const unavailable = [...qtyById.keys()].filter((id) => !listings.find((l) => String(l._id) === id && l.inStock));
    if (unavailable.length) return res.status(409).json({ message: 'Some items are no longer available. Please review your cart.' });

    const byVendor = new Map();
    for (const l of listings) {
      const list = byVendor.get(String(l.vendor)) || [];
      list.push({ listing: l._id, name: l.name, unit: l.unit, price: l.price, qty: qtyById.get(String(l._id)) });
      byVendor.set(String(l.vendor), list);
    }

    const orders = await Promise.all(
      [...byVendor.entries()].map(([vendor, its]) =>
        Order.create({
          customer: req.user._id, vendor, items: its, address: address.trim(), note,
          total: Math.round(its.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100,
        })
      )
    );
    res.status(201).json(orders);
  } catch (e) { next(e); }
});

router.get('/mine', auth('customer'), async (req, res, next) => {
  try {
    res.json(await Order.find({ customer: req.user._id }).populate('vendor', 'shopName stall phone').sort('-createdAt').lean());
  } catch (e) { next(e); }
});

router.get('/vendor', auth('vendor'), async (req, res, next) => {
  try {
    res.json(await Order.find({ vendor: req.user._id }).populate('customer', 'name phone').sort('-createdAt').lean());
  } catch (e) { next(e); }
});

router.patch('/:id/status', auth('vendor'), async (req, res, next) => {
  try {
    if (!STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findOneAndUpdate({ _id: req.params.id, vendor: req.user._id }, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (e) { next(e); }
});

export default router;
