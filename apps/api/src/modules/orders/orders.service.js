"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
var common_1 = require("@nestjs/common");
var domain_1 = require("@businessos/domain");
var node_crypto_1 = require("node:crypto");
var OrdersService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var OrdersService = _classThis = /** @class */ (function () {
        function OrdersService_1(prisma) {
            this.prisma = prisma;
        }
        OrdersService_1.prototype.list = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.assertTenant(tenantId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.prisma.order.findMany({
                                    where: { tenantId: tenantId },
                                    include: { items: true },
                                    orderBy: { createdAt: "desc" },
                                })];
                    }
                });
            });
        };
        OrdersService_1.prototype.create = function (tenantId, user, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var tenant, customer, products, lines, subtotal, discount, taxAmount, serviceCharge, total, paidAmount, dueAmount, status;
                var _this = this;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.tenant.findUnique({ where: { id: tenantId }, include: { branches: true } })];
                        case 1:
                            tenant = _c.sent();
                            if (!tenant)
                                throw new common_1.NotFoundException("Tenant not found.");
                            if (!tenant.branches.some(function (branch) { return branch.id === dto.branchId; })) {
                                throw new common_1.BadRequestException("Branch does not belong to tenant.");
                            }
                            if (!dto.items.length)
                                throw new common_1.BadRequestException("Order must include at least one item.");
                            if (user.branchId && user.branchId !== dto.branchId)
                                throw new common_1.BadRequestException("Your account is assigned to a different branch.");
                            if (!dto.customerId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.customer.findFirst({ where: { id: dto.customerId, tenantId: tenantId, active: true }, select: { id: true } })];
                        case 2:
                            customer = _c.sent();
                            if (!customer)
                                throw new common_1.BadRequestException("Customer does not belong to tenant.");
                            _c.label = 3;
                        case 3: return [4 /*yield*/, this.prisma.product.findMany({
                                where: { tenantId: tenantId, id: { in: dto.items.map(function (item) { return item.productId; }) }, active: true },
                            })];
                        case 4:
                            products = _c.sent();
                            lines = dto.items.map(function (item) {
                                var product = products.find(function (candidate) { return candidate.id === item.productId; });
                                if (!product)
                                    throw new common_1.BadRequestException("One or more products are invalid.");
                                if (Number(product.stock) < item.quantity)
                                    throw new common_1.BadRequestException("".concat(product.name, " does not have enough stock."));
                                var discountPrice = Number(product.discountPrice);
                                var unitPrice = discountPrice > 0 && discountPrice < Number(product.salePrice) ? discountPrice : Number(product.salePrice);
                                var total = unitPrice * item.quantity;
                                return { product: product, quantity: item.quantity, unitPrice: unitPrice, total: total };
                            });
                            subtotal = lines.reduce(function (total, line) { return total + line.total; }, 0);
                            discount = (_a = dto.discount) !== null && _a !== void 0 ? _a : 0;
                            if (discount > subtotal)
                                throw new common_1.BadRequestException("Discount cannot exceed subtotal.");
                            taxAmount = subtotal * (Number(tenant.vatRate) / 100);
                            serviceCharge = subtotal * (Number(tenant.serviceRate) / 100);
                            total = subtotal + taxAmount + serviceCharge - discount;
                            paidAmount = (_b = dto.paidAmount) !== null && _b !== void 0 ? _b : (dto.paymentMethod === "Due" ? 0 : total);
                            if (paidAmount > total)
                                throw new common_1.BadRequestException("Paid amount cannot exceed order total.");
                            dueAmount = total - paidAmount;
                            if (dueAmount > 0 && !dto.customerId)
                                throw new common_1.BadRequestException("A customer is required for a due sale.");
                            status = domain_1.businessTypeConfigs[tenant.businessType].orderStatuses[0];
                            return [2 /*return*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                    var movementRows, _i, lines_1, line, balance, updatedBalance, order;
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                movementRows = [];
                                                _i = 0, lines_1 = lines;
                                                _b.label = 1;
                                            case 1:
                                                if (!(_i < lines_1.length)) return [3 /*break*/, 6];
                                                line = lines_1[_i];
                                                return [4 /*yield*/, tx.inventoryBalance.findUnique({
                                                        where: { branchId_productId: { branchId: dto.branchId, productId: line.product.id } },
                                                    })];
                                            case 2:
                                                balance = _b.sent();
                                                if (!balance || Number(balance.quantity) < line.quantity) {
                                                    throw new common_1.BadRequestException("".concat(line.product.name, " does not have enough stock at this branch."));
                                                }
                                                return [4 /*yield*/, tx.inventoryBalance.updateMany({
                                                        where: { id: balance.id, quantity: { gte: line.quantity } },
                                                        data: { quantity: { decrement: line.quantity } },
                                                    })];
                                            case 3:
                                                updatedBalance = _b.sent();
                                                if (updatedBalance.count !== 1)
                                                    throw new common_1.BadRequestException("".concat(line.product.name, " stock changed. Review the cart and try again."));
                                                return [4 /*yield*/, tx.product.update({ where: { id: line.product.id }, data: { stock: { decrement: line.quantity } } })];
                                            case 4:
                                                _b.sent();
                                                movementRows.push({ productId: line.product.id, quantity: -line.quantity, balanceAfter: Number(balance.quantity) - line.quantity });
                                                _b.label = 5;
                                            case 5:
                                                _i++;
                                                return [3 /*break*/, 1];
                                            case 6: return [4 /*yield*/, tx.order.create({
                                                    data: {
                                                        tenantId: tenantId,
                                                        branchId: dto.branchId,
                                                        customerId: dto.customerId,
                                                        createdById: user.id,
                                                        orderNo: "ORD-".concat(new Date().toISOString().slice(0, 10).replaceAll("-", ""), "-").concat((0, node_crypto_1.randomUUID)().slice(0, 6).toUpperCase()),
                                                        source: dto.source,
                                                        orderType: (_a = dto.orderType) !== null && _a !== void 0 ? _a : "counter",
                                                        status: status,
                                                        paymentMethod: dto.paymentMethod,
                                                        paymentStatus: dueAmount > 0 ? "pending" : "captured",
                                                        subtotal: subtotal,
                                                        taxAmount: taxAmount,
                                                        serviceCharge: serviceCharge,
                                                        discount: discount,
                                                        total: total,
                                                        paidAmount: paidAmount,
                                                        dueAmount: dueAmount,
                                                        notes: dto.notes,
                                                        syncStatus: "synced",
                                                        items: {
                                                            create: lines.map(function (line) { return ({
                                                                productId: line.product.id,
                                                                name: line.product.name,
                                                                quantity: line.quantity,
                                                                unitPrice: line.unitPrice,
                                                                total: line.total,
                                                            }); }),
                                                        },
                                                        payments: paidAmount > 0 ? { create: { method: dto.paymentMethod, amount: paidAmount, status: "captured" } } : undefined,
                                                    },
                                                    include: { items: true, payments: true },
                                                })];
                                            case 7:
                                                order = _b.sent();
                                                return [4 /*yield*/, tx.inventoryMovement.createMany({
                                                        data: movementRows.map(function (movement) { return ({
                                                            tenantId: tenantId,
                                                            branchId: dto.branchId,
                                                            productId: movement.productId,
                                                            type: "sale",
                                                            quantity: movement.quantity,
                                                            balanceAfter: movement.balanceAfter,
                                                            referenceType: "Order",
                                                            referenceId: order.id,
                                                            createdById: user.id,
                                                        }); }),
                                                    })];
                                            case 8:
                                                _b.sent();
                                                if (!dto.customerId) return [3 /*break*/, 10];
                                                return [4 /*yield*/, tx.customer.update({
                                                        where: { id: dto.customerId },
                                                        data: { totalSpend: { increment: total }, due: { increment: dueAmount }, loyaltyPoints: { increment: Math.floor(total / 100) } },
                                                    })];
                                            case 9:
                                                _b.sent();
                                                _b.label = 10;
                                            case 10: return [4 /*yield*/, tx.auditLog.create({
                                                    data: { tenantId: tenantId, userId: user.id, action: "order.created", entityType: "Order", entityId: order.id, metadata: { orderNo: order.orderNo, total: total, paymentMethod: dto.paymentMethod } },
                                                })];
                                            case 11:
                                                _b.sent();
                                                return [2 /*return*/, order];
                                        }
                                    });
                                }); })];
                    }
                });
            });
        };
        OrdersService_1.prototype.assertTenant = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var tenant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } })];
                        case 1:
                            tenant = _a.sent();
                            if (!tenant)
                                throw new common_1.NotFoundException("Tenant not found.");
                            return [2 /*return*/];
                    }
                });
            });
        };
        return OrdersService_1;
    }());
    __setFunctionName(_classThis, "OrdersService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OrdersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OrdersService = _classThis;
}();
exports.OrdersService = OrdersService;
