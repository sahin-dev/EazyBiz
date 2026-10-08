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
exports.ModuleAccessGuard = void 0;
var common_1 = require("@nestjs/common");
var public_decorator_1 = require("./public.decorator");
var require_module_decorator_1 = require("./require-module.decorator");
var ModuleAccessGuard = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ModuleAccessGuard = _classThis = /** @class */ (function () {
        function ModuleAccessGuard_1(reflector, prisma) {
            this.reflector = reflector;
            this.prisma = prisma;
        }
        ModuleAccessGuard_1.prototype.canActivate = function (context) {
            return __awaiter(this, void 0, void 0, function () {
                var moduleId, request, user, routeTenantId, tenantId, tenant, subscription, enabled;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]))
                                return [2 /*return*/, true];
                            moduleId = this.reflector.getAllAndOverride(require_module_decorator_1.MODULE_KEY, [context.getHandler(), context.getClass()]);
                            if (!moduleId)
                                return [2 /*return*/, true];
                            request = context.switchToHttp().getRequest();
                            user = request.user;
                            routeTenantId = request.params.tenantId;
                            tenantId = user.role === "platformAdmin"
                                ? Array.isArray(routeTenantId) ? routeTenantId[0] : routeTenantId
                                : user.tenantId;
                            if (!tenantId)
                                throw new common_1.ForbiddenException("A tenant workspace is required.");
                            return [4 /*yield*/, this.prisma.tenant.findUnique({
                                    where: { id: tenantId },
                                    include: { subscription: true },
                                })];
                        case 1:
                            tenant = _a.sent();
                            subscription = tenant === null || tenant === void 0 ? void 0 : tenant.subscription;
                            if (!tenant ||
                                tenant.status === "suspended" ||
                                tenant.status === "cancelled" ||
                                !subscription ||
                                !["active", "trialing"].includes(subscription.status) ||
                                subscription.currentPeriodEnd <= new Date()) {
                                throw new common_1.ForbiddenException("The tenant subscription is not active.");
                            }
                            return [4 /*yield*/, this.prisma.tenantModule.findFirst({
                                    where: { tenantId: tenantId, moduleId: moduleId, enabled: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
                                    select: { moduleId: true },
                                })];
                        case 2:
                            enabled = _a.sent();
                            if (!enabled)
                                throw new common_1.ForbiddenException("The ".concat(moduleId, " module is not active for this subscription."));
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        return ModuleAccessGuard_1;
    }());
    __setFunctionName(_classThis, "ModuleAccessGuard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ModuleAccessGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ModuleAccessGuard = _classThis;
}();
exports.ModuleAccessGuard = ModuleAccessGuard;
