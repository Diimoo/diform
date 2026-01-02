const { requirePermission } = require('../../middleware/rbac');
const auditLogger = require('../../middleware/auditLogger'); // Import auditLogger

// GET all roles
router.get('/', requirePermission('roles', 'read'), async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions').populate('parentRole');
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET a single role by ID
router.get('/:id', requirePermission('roles', 'read'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate('permissions').populate('parentRole');
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching role by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST create a new role
router.post('/', requirePermission('roles', 'create'), auditLogger('role.create', { resourceType: 'Role' }, (req) => ({ newRoleName: req.body.name })), async (req, res) => {
  const { name, description, permissions, parentRole } = req.body;

  // Validate that provided permissions exist
  if (permissions && permissions.length > 0) {
    const existingPermissions = await Permission.find({ _id: { $in: permissions } });
    if (existingPermissions.length !== permissions.length) {
      return res.status(400).json({ message: 'One or more provided permissions do not exist.' });
    }
  }

  // Validate parentRole if provided
  if (parentRole) {
    const existingParentRole = await Role.findById(parentRole);
    if (!existingParentRole) {
      return res.status(400).json({ message: 'Provided parent role does not exist.' });
    }
  }

  try {
    const newRole = new Role({ name, description, permissions, parentRole });
    await newRole.save();
    res.status(201).json(newRole);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(409).json({ message: 'Role with this name already exists.' });
    }
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update an existing role
router.put('/:id', requirePermission('roles', 'update'), auditLogger('role.update', { resourceType: 'Role' }, (req) => ({ roleId: req.params.id, updatedFields: req.body })), async (req, res) => {
  const { name, description, permissions, parentRole } = req.body;

  // Validate that provided permissions exist
  if (permissions && permissions.length > 0) {
    const existingPermissions = await Permission.find({ _id: { $in: permissions } });
    if (existingPermissions.length !== permissions.length) {
      return res.status(400).json({ message: 'One or more provided permissions do not exist.' });
    }
  }

  // Validate parentRole if provided
  if (parentRole) {
    const existingParentRole = await Role.findById(parentRole);
    if (!existingParentRole) {
      return res.status(400).json({ message: 'Provided parent role does not exist.' });
    }
  }

  try {
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions, parentRole },
      { new: true, runValidators: true }
    ).populate('permissions').populate('parentRole');

    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(updatedRole);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(409).json({ message: 'Role with this name already exists.' });
    }
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a role
router.delete('/:id', requirePermission('roles', 'delete'), auditLogger('role.delete', { resourceType: 'Role' }, (req) => ({ roleId: req.params.id })), async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    // TODO: Consider handling users that might still have this role assigned.
    // For now, these users would become 'role-less' and their permissions would be based only on explicit user permissions.
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
