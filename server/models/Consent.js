const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    description: 'The ID of the user who provided or withdrew consent.'
  },
  categories: {
    type: Map, // Stores consent status for each category, e.g., { "analytics": true, "marketing": false }
    of: Boolean,
    required: true,
    default: {
      necessary: true, // Necessary cookies/data processing are always true
    },
    description: 'A map of consent categories to their boolean status (granted/withdrawn).'
  },
  version: {
    type: String,
    required: true,
    trim: true,
    description: 'The version of the consent policy agreed to by the user.'
  },
  grantedAt: {
    type: Date,
    required: true,
    default: Date.now,
    description: 'Timestamp when the consent was granted.'
  },
  withdrawnAt: {
    type: Date,
    description: 'Timestamp when the consent was withdrawn, if applicable.'
  },
  status: {
    type: String,
    enum: ['active', 'withdrawn'],
    default: 'active',
    required: true,
    description: 'The current status of the consent record.'
  },
  ipAddress: {
    type: String,
    trim: true,
    description: 'The IP address from which the consent action originated.'
  },
  userAgent: {
    type: String,
    trim: true,
    description: 'The user agent string of the client that initiated the consent action.'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Ensure only one active consent record per user for a given version
// This index will need careful handling if a user can have multiple active consents for different purposes/versions
// For simplicity, we'll assume a single overarching consent version for now.
consentSchema.index({ userId: 1, version: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });


const Consent = mongoose.model('Consent', consentSchema);

module.exports = Consent;
