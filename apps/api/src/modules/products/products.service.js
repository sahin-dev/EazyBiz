"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ProductsService = void 0;
var common_1 = require("@nestjs/common");
var ProductsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProductsService = _classThis = /** @class */ (function () {
        function ProductsService_1(prisma) {
            this.prisma = prisma;
        }
        ProductsService_1.prototype.list = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.assertTenant(tenantId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.prisma.product.findMany({
                                    where: { tenantId: tenantId, active: true },
                                    orderBy: [{ category: "asc" }, { name: "asc" }],
                                })];
                    }
                });
            });
        };
        ProductsService_1.prototype.create = function (tenantId, user, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var branchId, _a;
                var _this = this;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.assertTenant(tenantId)];
                        case 1:
                            _c.sent();
                            if (!((_b = user.branchId) !== null && _b !== void 0)) return [3 /*break*/, 2];
                            _a = _b;
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.defaultBranch(tenantId)];
                        case 3:
                            _a = (_c.sent());
                            _c.label = 4;
                        case 4:
                            branchId = _a;
                            return [2 /*return*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                    var product;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, tx.product.create({ data: __assign({ tenantId: tenantId }, dto) })];
                                            case 1:
                                                product = _a.sent();
                                                return [4 /*yield*/, tx.inventoryBalance.create({
                                                        data: { tenantId: tenantId, branchId: branchId, productId: product.id, quantity: dto.stock, minimumStock: dto.minimumStock },
                                                    })];
                                            case 2:
                                                _a.sent();
                                                if (!(dto.stock > 0)) return [3 /*break*/, 4];
                                                return [4 /*yield*/, tx.inventoryMovement.create({
                                                        data: { tenantId: tenantId, branchId: branchId, productId: product.id, type: "opening", quantity: dto.stock, balanceAfter: dto.stock, createdById: user.id },
                                                    })];
                                            case 3:
                                                _a.sent();
                                                _a.label = 4;
                                            case 4: return [4 /*yield*/, tx.auditLog.create({ data: { tenantId: tenantId, userId: user.id, action: "product.created", entityType: "Product", entityId: product.id } })];
                                            case 5:
                                                _a.sent();
                                                return [2 /*return*/, product];
                                        }
                                    });
                                }); })];
                    }
                });
            });
        };
        ProductsService_1.prototype.adjustStock = function (tenantId, productId, user, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var product, branchId, _a, branch;
                var _this = this;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.assertTenant(tenantId)];
                        case 1:
                            _d.sent();
                            return [4 /*yield*/, this.prisma.product.findFirst({ where: { id: productId, tenantId: tenantId } })];
                        case 2:
                            product = _d.sent();
                            if (!product)
                                throw new common_1.NotFoundException("Product not found.");
                            if (!((_c = (_b = dto.branchId) !== null && _b !== void 0 ? _b : user.branchId) !== null && _c !== void 0)) return [3 /*break*/, 3];
                            _a = _c;
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.defaultBranch(tenantId)];
                        case 4:
                            _a = (_d.sent());
                            _d.label = 5;
                        case 5:
                            branchId = _a;
                            return [4 /*yield*/, this.prisma.branch.findFirst({ where: { id: branchId, tenantId: tenantId, isActive: true }, select: { id: true } })];
                        case 6:
                            branch = _d.sent();
                            if (!branch)
                                throw new common_1.BadRequestException("Invalid branch.");
                            return [2 /*return*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                    var current, next, total, updated;
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0: return [4 /*yield*/, tx.inventoryBalance.findUnique({ where: { branchId_productId: { branchId: branchId, productId: productId } } })];
                                            case 1:
                                                current = _b.sent();
                                                next = Number((_a = current === null || current === void 0 ? void 0 : current.quantity) !== null && _a !== void 0 ? _a : 0) + dto.delta;
                                                total = Number(product.stock) + dto.delta;
                                                if (next < 0 || total < 0)
                                                    throw new common_1.BadRequestException("Stock cannot be negative.");
                                                return [4 /*yield*/, tx.inventoryBalance.upsert({
                                                        where: { branchId_productId: { branchId: branchId, productId: productId } },
                                                        create: { tenantId: tenantId, branchId: branchId, productId: productId, quantity: next, minimumStock: product.minimumStock },
                                                        update: { quantity: next },
                                                    })];
                                            case 2:
                                                _b.sent();
                                                return [4 /*yield*/, tx.product.update({ where: { id: productId }, data: { stock: total } })];
                                            case 3:
                                                updated = _b.sent();
                                                return [4 /*yield*/, tx.inventoryMovement.create({
                                                        data: { tenantId: tenantId, branchId: branchId, productId: productId, type: dto.type, quantity: dto.delta, balanceAfter: next, note: dto.reason, createdById: user.id },
                                                    })];
                                            case 4:
                                                _b.sent();
                                                return [4 /*yield*/, tx.auditLog.create({
                                                        data: { tenantId: tenantId, userId: user.id, action: "stock.adjusted", entityType: "Product", entityId: productId, metadata: { delta: dto.delta, branchId: branchId, reason: dto.reason } },
                                                    })];
                                            case 5:
                                                _b.sent();
                                                return [2 /*return*/, updated];
                                        }
                                    });
                                }); })];
                    }
                });
            });
        };
        ProductsService_1.prototype.defaultBranch = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var branch;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.branch.findFirst({ where: { tenantId: tenantId, isActive: true }, orderBy: { createdAt: "asc" } })];
                        case 1:
                            branch = _a.sent();
                            if (!branch)
                                throw new common_1.BadRequestException("No active branch is configured.");
                            return [2 /*return*/, branch.id];
                    }
                });
            });
        };
        ProductsService_1.prototype.assertTenant = function (tenantId) {
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
        return ProductsService_1;
    }());
    __setFunctionName(_classThis, "ProductsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductsService = _classThis;
}();
exports.ProductsService = ProductsService;
