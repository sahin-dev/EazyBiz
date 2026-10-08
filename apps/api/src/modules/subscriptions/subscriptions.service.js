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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
var common_1 = require("@nestjs/common");
var domain_1 = require("@businessos/domain");
var SubscriptionsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SubscriptionsService = _classThis = /** @class */ (function () {
        function SubscriptionsService_1(prisma) {
            this.prisma = prisma;
        }
        SubscriptionsService_1.prototype.get = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var tenant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.tenant.findUnique({
                                where: { id: tenantId },
                                include: {
                                    modules: { orderBy: { moduleId: "asc" } },
                                    subscription: { include: { payments: { orderBy: { createdAt: "desc" } } } },
                                },
                            })];
                        case 1:
                            tenant = _a.sent();
                            if (!tenant)
                                throw new common_1.NotFoundException("Tenant not found.");
                            if (!tenant.subscription)
                                throw new common_1.NotFoundException("Subscription is not configured.");
                            return [2 /*return*/, {
                                    subscription: tenant.subscription,
                                    plans: domain_1.planCatalog,
                                    modules: this.modulesForTenant(tenant.businessType, tenant.modules),
                                }];
                    }
                });
            });
        };
        SubscriptionsService_1.prototype.listModules = function (tenantId) {
            return __awaiter(this, void 0, void 0, function () {
                var tenant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.tenant.findUnique({
                                where: { id: tenantId },
                                include: { modules: true },
                            })];
                        case 1:
                            tenant = _a.sent();
                            if (!tenant)
                                throw new common_1.NotFoundException("Tenant not found.");
                            return [2 /*return*/, this.modulesForTenant(tenant.businessType, tenant.modules)];
                    }
                });
            });
        };
        SubscriptionsService_1.prototype.setModule = function (tenantId, user, moduleId, enabled) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var tenant, definition, tenantModule, enabledModules, amount;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.tenant.findUnique({
                                            where: { id: tenantId },
                                            include: { modules: true, subscription: true },
                                        })];
                                    case 1:
                                        tenant = _a.sent();
                                        if (!tenant)
                                            throw new common_1.NotFoundException("Tenant not found.");
                                        if (!tenant.subscription)
                                            throw new common_1.NotFoundException("Subscription is not configured.");
                                        definition = domain_1.moduleCatalog.find(function (module) { return module.id === moduleId; });
                                        if (!definition || !definition.businessTypes.includes(tenant.businessType)) {
                                            throw new common_1.BadRequestException("This module is not available for the tenant's business type.");
                                        }
                                        if (moduleId === "pos" && !enabled) {
                                            throw new common_1.BadRequestException("The POS module is required and cannot be disabled.");
                                        }
                                        return [4 /*yield*/, tx.tenantModule.upsert({
                                                where: { tenantId_moduleId: { tenantId: tenantId, moduleId: moduleId } },
                                                create: { tenantId: tenantId, moduleId: moduleId, enabled: enabled },
                                                update: __assign({ enabled: enabled }, (enabled ? { activatedAt: new Date() } : {})),
                                            })];
                                    case 2:
                                        tenantModule = _a.sent();
                                        enabledModules = new Set(tenant.modules
                                            .filter(function (item) { return item.enabled; })
                                            .flatMap(function (item) { var _a, _b; return (_b = (_a = domain_1.moduleCatalog.find(function (module) { return module.id === item.moduleId; })) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : []; }));
                                        if (enabled)
                                            enabledModules.add(moduleId);
                                        else
                                            enabledModules.delete(moduleId);
                                        amount = (0, domain_1.calculateSubscriptionAmount)(parsePlanCode(tenant.subscription.planCode), __spreadArray([], enabledModules, true), tenant.subscription.interval);
                                        return [4 /*yield*/, tx.subscription.update({ where: { tenantId: tenantId }, data: { amount: amount } })];
                                    case 3:
                                        _a.sent();
                                        return [4 /*yield*/, tx.auditLog.create({
                                                data: {
                                                    tenantId: tenantId,
                                                    userId: user.id,
                                                    action: enabled ? "subscription.module_enabled" : "subscription.module_disabled",
                                                    entityType: "TenantModule",
                                                    entityId: "".concat(tenantId, ":").concat(moduleId),
                                                    metadata: { moduleId: moduleId, enabled: enabled, amount: amount },
                                                },
                                            })];
                                    case 4:
                                        _a.sent();
                                        return [2 /*return*/, __assign(__assign({}, tenantModule), { monthlyAmount: amount })];
                                }
                            });
                        }); })];
                });
            });
        };
        SubscriptionsService_1.prototype.updatePlan = function (tenantId, user, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var tenant, enabledModules, amount, subscription, plan;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.tenant.findUnique({
                                            where: { id: tenantId },
                                            include: { modules: true, subscription: true },
                                        })];
                                    case 1:
                                        tenant = _a.sent();
                                        if (!tenant)
                                            throw new common_1.NotFoundException("Tenant not found.");
                                        if (!tenant.subscription)
                                            throw new common_1.NotFoundException("Subscription is not configured.");
                                        enabledModules = tenant.modules
                                            .filter(function (item) { return item.enabled; })
                                            .flatMap(function (item) { var _a, _b; return (_b = (_a = domain_1.moduleCatalog.find(function (module) { return module.id === item.moduleId; })) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : []; });
                                        amount = (0, domain_1.calculateSubscriptionAmount)(dto.planCode, enabledModules, dto.interval);
                                        return [4 /*yield*/, tx.subscription.update({
                                                where: { tenantId: tenantId },
                                                data: { planCode: dto.planCode, interval: dto.interval, amount: amount },
                                            })];
                                    case 2:
                                        subscription = _a.sent();
                                        plan = domain_1.planCatalog.find(function (item) { return item.code === dto.planCode; });
                                        if (!plan)
                                            throw new common_1.BadRequestException("Unknown subscription plan.");
                                        return [4 /*yield*/, tx.tenant.update({ where: { id: tenantId }, data: { plan: plan.name } })];
                                    case 3:
                                        _a.sent();
                                        return [4 /*yield*/, tx.auditLog.create({
                                                data: {
                                                    tenantId: tenantId,
                                                    userId: user.id,
                                                    action: "subscription.plan_updated",
                                                    entityType: "Subscription",
                                                    entityId: subscription.id,
                                                    metadata: { planCode: dto.planCode, interval: dto.interval, amount: amount },
                                                },
                                            })];
                                    case 4:
                                        _a.sent();
                                        return [2 /*return*/, subscription];
                                }
                            });
                        }); })];
                });
            });
        };
        SubscriptionsService_1.prototype.recordPayment = function (tenantId, user, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var subscription, payment;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.subscription.findUnique({ where: { tenantId: tenantId } })];
                                    case 1:
                                        subscription = _a.sent();
                                        if (!subscription)
                                            throw new common_1.NotFoundException("Subscription is not configured.");
                                        return [4 /*yield*/, tx.subscriptionPayment.create({
                                                data: { subscriptionId: subscription.id, amount: subscription.amount, method: dto.method, reference: dto.reference, status: "pending" },
                                            })];
                                    case 2:
                                        payment = _a.sent();
                                        return [4 /*yield*/, tx.auditLog.create({
                                                data: {
                                                    tenantId: tenantId,
                                                    userId: user.id,
                                                    action: "subscription.payment_submitted",
                                                    entityType: "SubscriptionPayment",
                                                    entityId: payment.id,
                                                    metadata: { amount: Number(payment.amount), method: payment.method },
                                                },
                                            })];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/, payment];
                                }
                            });
                        }); })];
                });
            });
        };
        SubscriptionsService_1.prototype.listPayments = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.subscriptionPayment.findMany({
                            include: {
                                subscription: {
                                    select: { tenantId: true, planCode: true, interval: true, tenant: { select: { name: true, businessType: true } } },
                                },
                            },
                            orderBy: { createdAt: "desc" },
                        })];
                });
            });
        };
        SubscriptionsService_1.prototype.updatePaymentStatus = function (paymentId, user, status) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var payment, updatedPayment, now, start, currentPeriodEnd;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.subscriptionPayment.findUnique({
                                            where: { id: paymentId },
                                            include: { subscription: { include: { tenant: true } } },
                                        })];
                                    case 1:
                                        payment = _a.sent();
                                        if (!payment)
                                            throw new common_1.NotFoundException("Subscription payment not found.");
                                        if (payment.status === status)
                                            return [2 /*return*/, payment];
                                        return [4 /*yield*/, tx.subscriptionPayment.update({
                                                where: { id: paymentId },
                                                data: { status: status, paidAt: status === "captured" ? new Date() : null },
                                            })];
                                    case 2:
                                        updatedPayment = _a.sent();
                                        if (!(status === "captured" && payment.status !== "captured")) return [3 /*break*/, 5];
                                        now = new Date();
                                        start = payment.subscription.currentPeriodEnd > now ? payment.subscription.currentPeriodEnd : now;
                                        currentPeriodEnd = addBillingPeriod(start, payment.subscription.interval);
                                        return [4 /*yield*/, tx.subscription.update({
                                                where: { id: payment.subscriptionId },
                                                data: { status: "active", currentPeriodEnd: currentPeriodEnd, cancelAtPeriodEnd: false },
                                            })];
                                    case 3:
                                        _a.sent();
                                        return [4 /*yield*/, tx.tenant.update({ where: { id: payment.subscription.tenantId }, data: { status: "active" } })];
                                    case 4:
                                        _a.sent();
                                        _a.label = 5;
                                    case 5: return [4 /*yield*/, tx.auditLog.create({
                                            data: {
                                                tenantId: payment.subscription.tenantId,
                                                userId: user.id,
                                                action: "subscription.payment_".concat(status),
                                                entityType: "SubscriptionPayment",
                                                entityId: payment.id,
                                                metadata: { previousStatus: payment.status, status: status },
                                            },
                                        })];
                                    case 6:
                                        _a.sent();
                                        return [2 /*return*/, updatedPayment];
                                }
                            });
                        }); })];
                });
            });
        };
        SubscriptionsService_1.prototype.modulesForTenant = function (businessType, tenantModules) {
            var byId = new Map(tenantModules.map(function (item) { return [item.moduleId, item]; }));
            return domain_1.moduleCatalog
                .filter(function (module) { return module.businessTypes.includes(businessType); })
                .map(function (module) {
                var _a, _b, _c, _d, _e, _f;
                return (__assign(__assign({}, module), { enabled: (_b = (_a = byId.get(module.id)) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false, activatedAt: (_d = (_c = byId.get(module.id)) === null || _c === void 0 ? void 0 : _c.activatedAt) !== null && _d !== void 0 ? _d : null, expiresAt: (_f = (_e = byId.get(module.id)) === null || _e === void 0 ? void 0 : _e.expiresAt) !== null && _f !== void 0 ? _f : null }));
            });
        };
        return SubscriptionsService_1;
    }());
    __setFunctionName(_classThis, "SubscriptionsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SubscriptionsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SubscriptionsService = _classThis;
}();
exports.SubscriptionsService = SubscriptionsService;
function parsePlanCode(value) {
    var plan = domain_1.planCatalog.find(function (item) { return item.code === value; });
    if (!plan)
        throw new common_1.BadRequestException("The tenant has an unsupported subscription plan.");
    return plan.code;
}
function addBillingPeriod(date, interval) {
    var monthDelta = interval === "yearly" ? 12 : 1;
    var month = date.getUTCMonth() + monthDelta;
    var lastDay = new Date(Date.UTC(date.getUTCFullYear(), month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(date.getUTCFullYear(), month, Math.min(date.getUTCDate(), lastDay), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
}
