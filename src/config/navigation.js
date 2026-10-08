// @ts-check

/** @type {{id: import('../domain/types.js').ViewId, label: string, moduleId?: import('../domain/types.js').ModuleId, permission?: string, group: string}[]} */
export const navigationItems = [
  { id: "dashboard", label: "Dashboard", group: "Platform" },
  { id: "pos", label: "POS", moduleId: "pos", permission: "sale:create", group: "Sales" },
  { id: "orders", label: "Orders", moduleId: "pos", permission: "sale:create", group: "Sales" },
  { id: "products", label: "Products", group: "Products" },
  { id: "inventory", label: "Inventory", moduleId: "inventory", permission: "inventory:view", group: "Inventory" },
  { id: "suppliers", label: "Suppliers", moduleId: "suppliers", permission: "supplier:view", group: "Suppliers" },
  { id: "customers", label: "Customers", moduleId: "customers", permission: "customer:view", group: "Customers" },
  { id: "staff", label: "Staff", moduleId: "staff", permission: "staff:view", group: "Staff" },
  { id: "storefront", label: "Storefront", moduleId: "storefront", permission: "storefront:view", group: "Storefront" },
  { id: "reports", label: "Reports", moduleId: "reports", permission: "report:view", group: "Reports" },
  { id: "subscription", label: "Subscription", group: "Settings" },
  { id: "settings", label: "Settings", group: "Settings" },
  { id: "admin", label: "Super Admin", permission: "platform:admin", group: "Platform" },
];

/** @type {Record<import('../domain/types.js').RoleId, string[]>} */
export const permissionsByRole = {
  owner: ["*", "platform:admin"],
  admin: ["*", "platform:admin"],
  manager: ["sale:create", "sale:refund", "register:close", "inventory:view", "supplier:view", "customer:view", "staff:view", "report:view", "storefront:view"],
  cashier: ["sale:create", "customer:view", "customer:create"],
  inventoryManager: ["inventory:view", "inventory:adjust", "purchase:create", "purchase:receive", "supplier:view"],
  salesStaff: ["sale:create", "customer:view", "customer:create"],
  accountant: ["report:view", "profit:view", "supplier:view", "supplier:pay"],
  kitchenStaff: ["kitchen:view", "kitchen:update"],
  pharmacist: ["sale:create", "medicine:view", "prescription:approve", "inventory:view"],
  deliveryStaff: ["sale:create", "customer:view"],
};

/**
 * @param {import('../domain/types.js').Tenant} tenant
 * @param {import('../domain/types.js').RoleId} role
 */
export function getVisibleNavigation(tenant, role) {
  return navigationItems.filter((item) => {
    const moduleAllowed = !item.moduleId || tenant.enabledModules.includes(item.moduleId);
    const permissionAllowed = !item.permission || hasPermission(role, item.permission);
    return moduleAllowed && permissionAllowed;
  });
}

/**
 * @param {import('../domain/types.js').RoleId} role
 * @param {string} permission
 */
export function hasPermission(role, permission) {
  const permissions = permissionsByRole[role] || [];
  return permissions.includes("*") || permissions.includes(permission);
}
