"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAdminController = void 0;
var common_1 = require("@nestjs/common");
var roles_decorator_1 = require("../../common/auth/roles.decorator");
var PlatformAdminController = function () {
    var _classDecorators = [(0, common_1.Controller)("platform-admin"), (0, roles_decorator_1.Roles)("platformAdmin")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _listTenants_decorators;
    var _setTenantStatus_decorators;
    var _setTenantModule_decorators;
    var _listPayments_decorators;
    var _updatePaymentStatus_decorators;
    var PlatformAdminController = _classThis = /** @class */ (function () {
        function PlatformAdminController_1(tenants, subscriptions) {
            this.tenants = (__runInitializers(this, _instanceExtraInitializers), tenants);
            this.subscriptions = subscriptions;
        }
        PlatformAdminController_1.prototype.listTenants = function () {
            return this.tenants.listAll();
        };
        PlatformAdminController_1.prototype.setTenantStatus = function (tenantId, user, dto) {
            return this.tenants.setStatus(tenantId, user.id, dto.status);
        };
        PlatformAdminController_1.prototype.setTenantModule = function (tenantId, user, dto) {
            return this.subscriptions.setModule(tenantId, user, dto.moduleId, dto.enabled);
        };
        PlatformAdminController_1.prototype.listPayments = function () {
            return this.subscriptions.listPayments();
        };
        PlatformAdminController_1.prototype.updatePaymentStatus = function (paymentId, user, dto) {
            return this.subscriptions.updatePaymentStatus(paymentId, user, dto.status);
        };
        return PlatformAdminController_1;
    }());
    __setFunctionName(_classThis, "PlatformAdminController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _listTenants_decorators = [(0, common_1.Get)("tenants")];
        _setTenantStatus_decorators = [(0, common_1.Patch)("tenants/:tenantId/status")];
        _setTenantModule_decorators = [(0, common_1.Patch)("tenants/:tenantId/modules")];
        _listPayments_decorators = [(0, common_1.Get)("payments")];
        _updatePaymentStatus_decorators = [(0, common_1.Patch)("payments/:paymentId")];
        __esDecorate(_classThis, null, _listTenants_decorators, { kind: "method", name: "listTenants", static: false, private: false, access: { has: function (obj) { return "listTenants" in obj; }, get: function (obj) { return obj.listTenants; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setTenantStatus_decorators, { kind: "method", name: "setTenantStatus", static: false, private: false, access: { has: function (obj) { return "setTenantStatus" in obj; }, get: function (obj) { return obj.setTenantStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setTenantModule_decorators, { kind: "method", name: "setTenantModule", static: false, private: false, access: { has: function (obj) { return "setTenantModule" in obj; }, get: function (obj) { return obj.setTenantModule; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listPayments_decorators, { kind: "method", name: "listPayments", static: false, private: false, access: { has: function (obj) { return "listPayments" in obj; }, get: function (obj) { return obj.listPayments; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updatePaymentStatus_decorators, { kind: "method", name: "updatePaymentStatus", static: false, private: false, access: { has: function (obj) { return "updatePaymentStatus" in obj; }, get: function (obj) { return obj.updatePaymentStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PlatformAdminController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PlatformAdminController = _classThis;
}();
exports.PlatformAdminController = PlatformAdminController;
