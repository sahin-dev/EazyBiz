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
exports.DashboardService = void 0;
var common_1 = require("@nestjs/common");
function dhakaDayStart() {
    var parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts();
    var value = function (type) { var _a; return (_a = parts.find(function (part) { return part.type === type; })) === null || _a === void 0 ? void 0 : _a.value; };
    return new Date("".concat(value("year"), "-").concat(value("month"), "-").concat(value("day"), "T00:00:00+06:00"));
}
var DashboardService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var DashboardService = _classThis = /** @class */ (function () {
        function DashboardService_1(prisma) {
            this.prisma = prisma;
        }
        DashboardService_1.prototype.summary = function (tenantId, branchId) {
            return __awaiter(this, void 0, void 0, function () {
                var start, orderWhere, balanceWhere, _a, orders, balances, customers, suppliers, recentOrders, sales, itemTotals, _i, orders_1, order, _b, _c, item, current;
                var _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            start = dhakaDayStart();
                            orderWhere = __assign(__assign({ tenantId: tenantId }, (branchId ? { branchId: branchId } : {})), { createdAt: { gte: start } });
                            balanceWhere = __assign({ tenantId: tenantId }, (branchId ? { branchId: branchId } : {}));
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.order.findMany({ where: orderWhere, include: { items: true } }),
                                    this.prisma.inventoryBalance.findMany({ where: balanceWhere, include: { product: { select: { purchasePrice: true } } } }),
                                    this.prisma.customer.count({ where: { tenantId: tenantId, active: true } }),
                                    this.prisma.supplier.aggregate({ where: { tenantId: tenantId, active: true }, _sum: { payable: true } }),
                                    this.prisma.order.findMany({
                                        where: __assign({ tenantId: tenantId }, (branchId ? { branchId: branchId } : {})),
                                        include: { customer: { select: { name: true } }, items: { select: { quantity: true } } },
                                        orderBy: { createdAt: "desc" },
                                        take: 8,
                                    }),
                                ])];
                        case 1:
                            _a = _f.sent(), orders = _a[0], balances = _a[1], customers = _a[2], suppliers = _a[3], recentOrders = _a[4];
                            sales = orders.reduce(function (sum, order) { return sum + Number(order.total); }, 0);
                            itemTotals = new Map();
                            for (_i = 0, orders_1 = orders; _i < orders_1.length; _i++) {
                                order = orders_1[_i];
                                for (_b = 0, _c = order.items; _b < _c.length; _b++) {
                                    item = _c[_b];
                                    current = (_d = itemTotals.get(item.name)) !== null && _d !== void 0 ? _d : { name: item.name, quantity: 0, sales: 0 };
                                    current.quantity += Number(item.quantity);
                                    current.sales += Number(item.total);
                                    itemTotals.set(item.name, current);
                                }
                            }
                            return [2 /*return*/, {
                                    metrics: {
                                        sales: sales,
                                        orderCount: orders.length,
                                        averageOrder: orders.length ? sales / orders.length : 0,
                                        dueAmount: orders.reduce(function (sum, order) { return sum + Number(order.dueAmount); }, 0),
                                        lowStockCount: balances.filter(function (item) { return Number(item.quantity) <= Number(item.minimumStock); }).length,
                                        stockValue: balances.reduce(function (sum, item) { return sum + Number(item.quantity) * Number(item.product.purchasePrice); }, 0),
                                        customerCount: customers,
                                        supplierPayable: Number((_e = suppliers._sum.payable) !== null && _e !== void 0 ? _e : 0),
                                    },
                                    recentOrders: recentOrders,
                                    topProducts: __spreadArray([], itemTotals.values(), true).sort(function (a, b) { return b.quantity - a.quantity; }).slice(0, 5),
                                }];
                    }
                });
            });
        };
        DashboardService_1.prototype.report = function (tenantId, days) {
            return __awaiter(this, void 0, void 0, function () {
                var range, start, orders, daily, _i, orders_2, order, date, current, paymentMix;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            range = Math.min(Math.max(days, 7), 90);
                            start = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
                            return [4 /*yield*/, this.prisma.order.findMany({ where: { tenantId: tenantId, createdAt: { gte: start } }, orderBy: { createdAt: "asc" } })];
                        case 1:
                            orders = _b.sent();
                            daily = new Map();
                            for (_i = 0, orders_2 = orders; _i < orders_2.length; _i++) {
                                order = orders_2[_i];
                                date = order.createdAt.toISOString().slice(0, 10);
                                current = (_a = daily.get(date)) !== null && _a !== void 0 ? _a : { date: date, sales: 0, orders: 0 };
                                current.sales += Number(order.total);
                                current.orders += 1;
                                daily.set(date, current);
                            }
                            paymentMix = Object.entries(orders.reduce(function (result, order) {
                                var _a;
                                var _b;
                                return (__assign(__assign({}, result), (_a = {}, _a[order.paymentMethod] = ((_b = result[order.paymentMethod]) !== null && _b !== void 0 ? _b : 0) + Number(order.total), _a)));
                            }, {})).map(function (_a) {
                                var method = _a[0], amount = _a[1];
                                return ({ method: method, amount: amount });
                            });
                            return [2 /*return*/, { range: range, daily: __spreadArray([], daily.values(), true), paymentMix: paymentMix, totalSales: orders.reduce(function (sum, item) { return sum + Number(item.total); }, 0), orderCount: orders.length }];
                    }
                });
            });
        };
        return DashboardService_1;
    }());
    __setFunctionName(_classThis, "DashboardService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DashboardService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DashboardService = _classThis;
}();
exports.DashboardService = DashboardService;
