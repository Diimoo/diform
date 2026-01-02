const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    description: 'The unique name of the role (e.g., "admin", "editor").'
  },
  description: {
    type: String,
    trim: true,
    description: 'A brief description of the role.'
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    description: 'Permissions directly assigned to this role.'
  }],
  parentRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null,
    description: 'The parent role from which this role inherits permissions.'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Static method to find a role by name
roleSchema.statics.findByName = async function(name) {
  return this.findOne({ name });
};

// Method to get all effective permissions for a role, including inherited ones
roleSchema.methods.getEffectivePermissions = async function() {
  const Permission = mongoose.model('Permission');
  const Role = mongoose.model('Role');
  const permissionSet = new Set();

  // Add own permissions
  this.permissions.forEach(p => permissionSet.add(p.toString()));

  // Recursively add permissions from parent roles
  if (this.parentRole) {
    const parent = await Role.findById(this.parentRole);
    if (parent) {
      const parentPermissions = await parent.getEffectivePermissions();
      parentPermissions.forEach(p => permissionSet.add(p._id.toString()));
    }
  }

  // Fetch all unique permissions objects
  const effectivePermissions = await Permission.find({ _id: { $in: Array.from(permissionSet) } });
  return effectivePermissions;
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;