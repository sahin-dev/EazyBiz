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
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var bcryptjs_1 = require("bcryptjs");
var AuthService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthService = _classThis = /** @class */ (function () {
        function AuthService_1(prisma, jwt) {
            this.prisma = prisma;
            this.jwt = jwt;
        }
        AuthService_1.prototype.login = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var user, _a, profile;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { email: dto.email.toLowerCase() },
                                include: { tenant: { include: { branches: true, modules: true, storefront: true, subscription: true } } },
                            })];
                        case 1:
                            user = _c.sent();
                            _a = !user ||
                                user.status !== "active" ||
                                (user.role === "platformAdmin" ? user.tenantId !== null : !user.tenant || !["trial", "active"].includes(user.tenant.status));
                            if (_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, (0, bcryptjs_1.compare)(dto.password, user.passwordHash)];
                        case 2:
                            _a = !(_c.sent());
                            _c.label = 3;
                        case 3:
                            if (_a) {
                                throw new common_1.UnauthorizedException("Email or password is incorrect.");
                            }
                            return [4 /*yield*/, this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })];
                        case 4:
                            _c.sent();
                            profile = this.toAuthUser(user);
                            _b = {};
                            return [4 /*yield*/, this.jwt.signAsync({ sub: user.id, tenantId: user.tenantId, role: user.role })];
                        case 5: return [2 /*return*/, (_b.accessToken = _c.sent(),
                                _b.expiresIn = 28800,
                                _b.user = profile,
                                _b.tenant = user.tenant ? this.toTenant(user.tenant) : null,
                                _b)];
                    }
                });
            });
        };
        AuthService_1.prototype.session = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: userId },
                                include: { tenant: { include: { branches: true, modules: true, storefront: true, subscription: true } } },
                            })];
                        case 1:
                            user = _a.sent();
                            if (!user || user.status !== "active")
                                throw new common_1.UnauthorizedException();
                            if (!user.tenantId) {
                                if (user.role !== "platformAdmin")
                                    throw new common_1.UnauthorizedException();
                                return [2 /*return*/, { user: this.toAuthUser(user), tenant: null }];
                            }
                            if (!user.tenant)
                                throw new common_1.UnauthorizedException();
                            return [2 /*return*/, { user: this.toAuthUser(user), tenant: this.toTenant(user.tenant) }];
                    }
                });
            });
        };
        AuthService_1.prototype.toAuthUser = function (user) {
            return { id: user.id, tenantId: user.tenantId, branchId: user.branchId, name: user.name, email: user.email, role: user.role };
        };
        AuthService_1.prototype.toTenant = function (tenant) {
            var _a, _b;
            return {
                id: tenant.id,
                name: tenant.name,
                businessType: tenant.businessType,
                plan: tenant.plan,
                status: tenant.status,
                currency: tenant.currency,
                vatRate: Number(tenant.vatRate),
                serviceRate: Number(tenant.serviceRate),
                branches: tenant.branches.filter(function (branch) { return branch.isActive; }),
                enabledModules: tenant.modules.filter(function (item) { return item.enabled; }).map(function (item) { return item.moduleId; }),
                storefrontStatus: (_b = (_a = tenant.storefront) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "draft",
                subscription: tenant.subscription,
            };
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
