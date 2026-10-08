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
exports.SubscriptionsController = void 0;
var common_1 = require("@nestjs/common");
var roles_decorator_1 = require("../../common/auth/roles.decorator");
var SubscriptionsController = function () {
    var _classDecorators = [(0, common_1.Controller)("tenants/:tenantId/subscription"), (0, roles_decorator_1.Roles)("owner", "admin", "platformAdmin")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _get_decorators;
    var _listModules_decorators;
    var _toggleModule_decorators;
    var _updatePlan_decorators;
    var _submitPayment_decorators;
    var SubscriptionsController = _classThis = /** @class */ (function () {
        function SubscriptionsController_1(subscriptions) {
            this.subscriptions = (__runInitializers(this, _instanceExtraInitializers), subscriptions);
        }
        SubscriptionsController_1.prototype.get = function (tenantId) {
            return this.subscriptions.get(tenantId);
        };
        SubscriptionsController_1.prototype.listModules = function (tenantId) {
            return this.subscriptions.listModules(tenantId);
        };
        SubscriptionsController_1.prototype.toggleModule = function (tenantId, user, dto) {
            return this.subscriptions.setModule(tenantId, user, dto.moduleId, dto.enabled);
        };
        SubscriptionsController_1.prototype.updatePlan = function (tenantId, user, dto) {
            return this.subscriptions.updatePlan(tenantId, user, dto);
        };
        SubscriptionsController_1.prototype.submitPayment = function (tenantId, user, dto) {
            return this.subscriptions.recordPayment(tenantId, user, dto);
        };
        return SubscriptionsController_1;
    }());
    __setFunctionName(_classThis, "SubscriptionsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _get_decorators = [(0, common_1.Get)()];
        _listModules_decorators = [(0, common_1.Get)("modules")];
        _toggleModule_decorators = [(0, common_1.Patch)("modules")];
        _updatePlan_decorators = [(0, common_1.Patch)()];
        _submitPayment_decorators = [(0, common_1.Post)("payments")];
        __esDecorate(_classThis, null, _get_decorators, { kind: "method", name: "get", static: false, private: false, access: { has: function (obj) { return "get" in obj; }, get: function (obj) { return obj.get; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listModules_decorators, { kind: "method", name: "listModules", static: false, private: false, access: { has: function (obj) { return "listModules" in obj; }, get: function (obj) { return obj.listModules; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleModule_decorators, { kind: "method", name: "toggleModule", static: false, private: false, access: { has: function (obj) { return "toggleModule" in obj; }, get: function (obj) { return obj.toggleModule; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updatePlan_decorators, { kind: "method", name: "updatePlan", static: false, private: false, access: { has: function (obj) { return "updatePlan" in obj; }, get: function (obj) { return obj.updatePlan; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _submitPayment_decorators, { kind: "method", name: "submitPayment", static: false, private: false, access: { has: function (obj) { return "submitPayment" in obj; }, get: function (obj) { return obj.submitPayment; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SubscriptionsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SubscriptionsController = _classThis;
}();
exports.SubscriptionsController = SubscriptionsController;
