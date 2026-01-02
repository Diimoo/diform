const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption'); // Import encryption utilities
const logger = require('../config/logger'); // Import logger

const userSchema = new mongoose.Schema({
  encryptedEmail: { // Stores the encrypted email
    type: String,
    required: true,
    unique: true, // This field ensures uniqueness of encrypted values
    index: true, // Index this field for efficient lookups on encrypted value
    select: false // Do not return by default
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
    // Kept for backward compatibility - will be deprecated in favor of roles array
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
    // User-specific permission overrides (optional)
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true, // Ensure virtuals are included
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.encryptedEmail; // Remove the encrypted field from JSON output
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for email property (handles encryption/decryption transparently)
userSchema.virtual('email')
  .get(function() {
    // Only decrypt if encryptedEmail exists
    if (this.encryptedEmail) {
      try {
        return decrypt(this.encryptedEmail);
      } catch (error) {
        logger.error('Error decrypting user email:', error);
        return 'decryption_error'; // Handle decryption errors gracefully
      }
    }
    return undefined; // Or null, depending on desired behavior for missing email
  })
  .set(function(value) {
    // Store the plaintext email in a temporary property to be encrypted on save
    this._email = value;
    // Mark 'email' as modified to trigger the pre-save hook
    this.markModified('email');
  });


// Hash password and encrypt email before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Encrypt email if the virtual 'email' property has been set/modified
  // Check this._email because 'email' is a virtual and won't be directly present as a modified path
  if (this.isModified('email') && this._email) {
    try {
      this.encryptedEmail = encrypt(this._email);
    } catch (error) {
      logger.error('Error encrypting user email before saving:', error);
      return next(error); // Pass encryption error to Mongoose
    }
    // Clear the temporary _email field after encryption
    this._email = undefined;
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get all effective permissions (from roles + user-specific overrides)
userSchema.methods.getEffectivePermissions = async function() {
  const Permission = mongoose.model('Permission');
  const Role = mongoose.model('Role');

  const permissionSet = new Set();

  // 1. Get permissions from all roles
  if (this.roles && this.roles.length > 0) {
    const roleObjs = await Role.find({ _id: { $in: this.roles } });
    for (const role of roleObjs) {
      const rolePerms = await role.getEffectivePermissions();
      rolePerms.forEach(p => permissionSet.add(p._id.toString()));
    }
  }

  // 2. Add user-specific permission overrides
  if (this.permissions && this.permissions.length > 0) {
    this.permissions.forEach(p => permissionSet.add(p.toString()));
  }

  // 3. Fetch all unique permissions
  const permissions = await Permission.find({ _id: { $in: Array.from(permissionSet) } });
  return permissions;
};

// Check if user has a specific permission
userSchema.methods.hasPermission = async function(resource, action) {
  const permissions = await this.getEffectivePermissions();
  return permissions.some(p => p.resource === resource && p.action === action);
};

// Check if user has any of the specified permissions (OR logic)
userSchema.methods.hasAnyPermission = async function(permissionChecks) {
  const permissions = await this.getEffectivePermissions();
  return permissionChecks.some(({ resource, action }) =>
    permissions.some(p => p.resource === resource && p.action === action)
  );
};

// Check if user has all of the specified permissions (AND logic)
userSchema.methods.hasAllPermissions = async function(permissionChecks) {
  const permissions = await this.getEffectivePermissions();
  return permissionChecks.every(({ resource, action }) =>
    permissions.some(p => p.resource === resource && p.action === action)
  );
};

// Migrate old role to new roles system (backward compatibility)
userSchema.methods.migrateToRoles = async function() {
  if (!this.roles || this.roles.length === 0) {
    const Role = mongoose.model('Role');
    const roleName = this.role || 'user';
    const roleObj = await Role.findByName(roleName);
    if (roleObj) {
      this.roles = [roleObj._id];
      await this.save();
    }
  }
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
