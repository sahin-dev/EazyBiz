"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var domain_1 = require("@businessos/domain");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
var demoPassword = "Demo@12345";
var businesses = [
    {
        name: "ABC Restaurant",
        businessType: "restaurant",
        phone: "01711112222",
        email: "owner@abcrestaurant.bd",
        owner: "Farhan Rahman",
        branch: "Dhanmondi",
        products: [
            ["Chicken Biryani", "RES-001", "Rice & Biryani", 165, 280, "plate", 42, 10],
            ["Beef Burger", "RES-002", "Fast Food", 120, 220, "piece", 28, 8],
            ["Cold Coffee", "RES-003", "Beverage", 55, 140, "glass", 18, 10],
            ["Grilled Chicken", "RES-004", "Main Course", 220, 390, "plate", 16, 6],
        ],
    },
    {
        name: "ABC Pharmacy",
        businessType: "pharmacy",
        phone: "01733334444",
        email: "owner@abcpharmacy.bd",
        owner: "Dr. Imran Kabir",
        branch: "Mirpur",
        products: [
            ["Paracetamol 500mg", "MED-001", "Tablet", 1.4, 2, "piece", 2200, 300],
            ["Omeprazole 20mg", "MED-002", "Capsule", 4.9, 7, "piece", 780, 120],
            ["Vitamin C", "MED-003", "Supplement", 3.5, 6, "piece", 95, 100],
            ["Oral Saline", "MED-004", "First Aid", 5, 6, "sachet", 320, 80],
        ],
    },
    {
        name: "ABC Grocery",
        businessType: "grocery",
        phone: "01855556666",
        email: "owner@abcgrocery.bd",
        owner: "Nusrat Jahan",
        branch: "Chattogram",
        products: [
            ["Miniket Rice 5kg", "GRO-001", "Rice & Grains", 370, 420, "bag", 31, 12],
            ["Fresh Milk 1L", "GRO-002", "Dairy", 82, 95, "bottle", 21, 15],
            ["Soybean Oil 5L", "GRO-003", "Cooking Essentials", 760, 820, "bottle", 7, 10],
            ["Red Lentil 1kg", "GRO-004", "Rice & Grains", 128, 145, "pack", 46, 12],
        ],
    },
];
function resetDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.auditLog.deleteMany()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.subscriptionPayment.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.subscription.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.orderPayment.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.orderItem.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.order.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.inventoryMovement.deleteMany()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.purchaseItem.deleteMany()];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, prisma.purchase.deleteMany()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, prisma.inventoryBalance.deleteMany()];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.deleteMany()];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, prisma.supplier.deleteMany()];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, prisma.customer.deleteMany()];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, prisma.staffMember.deleteMany()];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, prisma.storefront.deleteMany()];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, prisma.tenantModule.deleteMany()];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 17:
                    _a.sent();
                    return [4 /*yield*/, prisma.branch.deleteMany()];
                case 18:
                    _a.sent();
                    return [4 /*yield*/, prisma.tenant.deleteMany()];
                case 19:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function createBusiness(input, passwordHash) {
    return __awaiter(this, void 0, void 0, function () {
        var config, tenant, branch, owner, _i, _a, _b, name_1, sku, category, purchasePrice, salePrice, unit, stock, minimumStock, attributes, product;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    config = domain_1.businessTypeConfigs[input.businessType];
                    return [4 /*yield*/, prisma.tenant.create({
                            data: {
                                name: input.name,
                                businessType: input.businessType,
                                status: "active",
                                phone: input.phone,
                                email: input.email,
                                plan: "Business",
                                serviceRate: input.businessType === "restaurant" ? 5 : 0,
                                branches: { create: { name: input.branch, code: "MAIN", address: "".concat(input.branch, ", Bangladesh"), phone: input.phone } },
                                modules: { create: config.recommendedModules.map(function (moduleId) { return ({ moduleId: moduleId }); }) },
                                subscription: {
                                    create: {
                                        planCode: "business",
                                        status: "active",
                                        amount: (0, domain_1.calculateSubscriptionAmount)("business", config.recommendedModules, "monthly"),
                                        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                                    },
                                },
                                storefront: {
                                    create: {
                                        slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                                        heroTitle: input.name,
                                        tagline: "Quality products, delivered with care.",
                                        theme: config.storefrontTheme,
                                        sections: [
                                            { id: "hero", type: "hero", title: input.name, subtitle: "Order online for delivery or pickup.", visible: true },
                                            { id: "categories", type: "categories", title: "Shop by category", subtitle: "Find what you need quickly.", visible: true },
                                            { id: "featured", type: "featuredProducts", title: "Featured products", subtitle: "Popular with our customers.", visible: true },
                                        ],
                                    },
                                },
                            },
                            include: { branches: true },
                        })];
                case 1:
                    tenant = _c.sent();
                    branch = tenant.branches[0];
                    return [4 /*yield*/, prisma.user.create({
                            data: { tenantId: tenant.id, branchId: branch.id, name: input.owner, email: input.email, phone: input.phone, passwordHash: passwordHash, role: "owner" },
                        })];
                case 2:
                    owner = _c.sent();
                    _i = 0, _a = input.products;
                    _c.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    _b = _a[_i], name_1 = _b[0], sku = _b[1], category = _b[2], purchasePrice = _b[3], salePrice = _b[4], unit = _b[5], stock = _b[6], minimumStock = _b[7];
                    attributes = input.businessType === "pharmacy"
                        ? { genericName: name_1.split(" ")[0], manufacturer: "Local manufacturer", prescriptionRequired: false }
                        : input.businessType === "restaurant"
                            ? { prepTime: 20, kitchenStation: "Main Kitchen", hasRecipe: true }
                            : { weightBased: false, packSize: unit, mrp: salePrice };
                    return [4 /*yield*/, prisma.product.create({
                            data: { tenantId: tenant.id, name: name_1, sku: sku, category: category, purchasePrice: purchasePrice, salePrice: salePrice, unit: unit, stock: stock, minimumStock: minimumStock, featured: true, attributes: attributes },
                        })];
                case 4:
                    product = _c.sent();
                    return [4 /*yield*/, prisma.inventoryBalance.create({
                            data: { tenantId: tenant.id, branchId: branch.id, productId: product.id, quantity: stock, minimumStock: minimumStock },
                        })];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, prisma.inventoryMovement.create({
                            data: { tenantId: tenant.id, branchId: branch.id, productId: product.id, type: "opening", quantity: stock, balanceAfter: stock, createdById: owner.id },
                        })];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [4 /*yield*/, prisma.supplier.create({
                        data: { tenantId: tenant.id, name: "".concat(input.name, " Primary Supplier"), category: "General", phone: "01700000000", address: "Dhaka, Bangladesh" },
                    })];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, prisma.customer.create({
                            data: { tenantId: tenant.id, name: "Walk-in Customer", phone: "01".concat(tenant.id.replace(/\D/g, "").slice(0, 9).padEnd(9, "0")) },
                        })];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, prisma.staffMember.create({
                            data: { tenantId: tenant.id, branchId: branch.id, employeeNo: "EMP-001", name: "".concat(input.branch, " Cashier"), role: "Cashier", shift: "10:00 AM - 8:00 PM", salary: 22000 },
                        })];
                case 11:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var passwordHash, _i, businesses_1, business;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resetDatabase()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, bcryptjs_1.hash)(demoPassword, 12)];
                case 2:
                    passwordHash = _a.sent();
                    _i = 0, businesses_1 = businesses;
                    _a.label = 3;
                case 3:
                    if (!(_i < businesses_1.length)) return [3 /*break*/, 6];
                    business = businesses_1[_i];
                    return [4 /*yield*/, createBusiness(business, passwordHash)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, prisma.$disconnect()];
}); }); })
    .catch(function (error) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.error(error);
                return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                process.exit(1);
                return [2 /*return*/];
        }
    });
}); });
