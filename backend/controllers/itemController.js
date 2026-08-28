const Item = require('../models/Item');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');

// ─── @route   POST /api/items ─────────────────────────────────────────────────
const createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, date, contactInfo } = req.body;

    // Validate required fields
    if (!title || !description || !type || !category || !location || !date) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, type, category, location, and date are required',
      });
    }

    const itemData = {
      title: title.trim(),
      description: description.trim(),
      type,
      category,
      location: location.trim(),
      date: new Date(date),
      contactInfo: contactInfo ? contactInfo.trim() : '',
      postedBy: req.user._id,
    };

    // Upload image to Cloudinary if provided
    if (req.file && req.file.buffer) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        itemData.image = {
          url: result.secure_url,
          publicId: result.public_id,
        };
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr.message);
        // Continue without image rather than failing the entire request
      }
    }

    const item = await Item.create(itemData);
    await item.populate('postedBy', 'name email rollNumber');

    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('CreateItem error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error creating item' });
  }
};

// ─── @route   GET /api/items ──────────────────────────────────────────────────
const getItems = async (req, res) => {
  try {
    const {
      type,
      category,
      status = 'active',
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const filter = {};

    if (type && ['lost', 'found'].includes(type)) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('postedBy', 'name email rollNumber')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('GetItems error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching items' });
  }
};

// ─── @route   GET /api/items/:id ─────────────────────────────────────────────
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'postedBy',
      'name email rollNumber phone'
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, item });
  } catch (error) {
    console.error('GetItem error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route   PUT /api/items/:id ─────────────────────────────────────────────
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item',
      });
    }

    const { title, description, type, category, location, date, contactInfo, status } = req.body;

    const updateData = {
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(type && { type }),
      ...(category && { category }),
      ...(location && { location: location.trim() }),
      ...(date && { date: new Date(date) }),
      ...(contactInfo !== undefined && { contactInfo: contactInfo.trim() }),
      ...(status && { status }),
    };

    // New image uploaded
    if (req.file && req.file.buffer) {
      // Delete old image from Cloudinary
      if (item.image && item.image.publicId) {
        await cloudinary.uploader.destroy(item.image.publicId);
      }
      try {
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        updateData.image = {
          url: result.secure_url,
          publicId: result.public_id,
        };
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr.message);
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'name email rollNumber');

    res.status(200).json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('UpdateItem error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error updating item' });
  }
};

// ─── @route   DELETE /api/items/:id ──────────────────────────────────────────
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item',
      });
    }

    if (item.image && item.image.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId);
    }

    await item.deleteOne();

    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('DeleteItem error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(500).json({ success: false, message: 'Server error deleting item' });
  }
};

// ─── @route   GET /api/items/user/my-items ────────────────────────────────────
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id }).sort('-createdAt').lean();
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('GetMyItems error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createItem, getItems, getItem, updateItem, deleteItem, getMyItems };
