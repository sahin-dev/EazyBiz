import { hasPermission, type ModuleId, type PermissionId } from "@businessos/domain";

const destinations: Array<{ href: string; permission: PermissionId; modules: ModuleId[] }> = [
  { href: "/dashboard", permission: "dashboard:view", modules: ["pos", "inventory"] },
  { href: "/pos", permission: "sale:create", modules: ["pos", "inventory"] },
  { href: "/inventory", permission: "inventory:view", modules: ["inventory"] },
  { href: "/kitchen", permission: "kitchen:view", modules: ["restaurantKitchen"] },
  { href: "/reports", permission: "report:view", modules: ["reports"] },
  { href: "/orders", permission: "order:view", modules: ["pos"] },
];

export function workspaceHome(role: string, enabledModules: ModuleId[] = []): string {
  if (role === "platformAdmin") return "/platform-admin";
  const preferred = role === "kitchenStaff" ? "/kitchen" : role === "inventoryManager" ? "/inventory" : ["cashier", "salesStaff", "pharmacist"].includes(role) ? "/pos" : "/dashboard";
  const available = destinations.filter((item) => hasPermission(role, item.permission) && item.modules.every((module) => enabledModules.includes(module)));
  return available.find((item) => item.href === preferred)?.href ?? available[0]?.href ?? "/access";
}
