const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    description: 'The resource this permission applies to (e.g., "users", "tasks", "settings").'
  },
  action: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    description: 'The action permitted on the resource (e.g., "read", "create", "update", "delete").'
  },
  description: {
    type: String,
    trim: true,
    description: 'A brief description of what this permission grants.'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Ensure that the combination of resource and action is unique
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

// Static method to find a permission by resource and action
permissionSchema.statics.findByResourceAndAction = async function(resource, action) {
  return this.findOne({ resource, action });
};

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;