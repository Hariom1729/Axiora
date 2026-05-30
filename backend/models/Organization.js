const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscriptionPlan: { type: String, enum: ['Free', 'Pro', 'Enterprise'], default: 'Free' },
    logoUrl: { type: String },
    website: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
