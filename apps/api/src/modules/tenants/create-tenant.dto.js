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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTenantDto = void 0;
var domain_1 = require("@businessos/domain");
var class_validator_1 = require("class-validator");
var CreateTenantDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _businessType_decorators;
    var _businessType_initializers = [];
    var _businessType_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _branchName_decorators;
    var _branchName_initializers = [];
    var _branchName_extraInitializers = [];
    var _branchAddress_decorators;
    var _branchAddress_initializers = [];
    var _branchAddress_extraInitializers = [];
    var _ownerName_decorators;
    var _ownerName_initializers = [];
    var _ownerName_extraInitializers = [];
    var _password_decorators;
    var _password_initializers = [];
    var _password_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateTenantDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.businessType = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _businessType_initializers, void 0));
                this.phone = (__runInitializers(this, _businessType_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.email = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _email_initializers, void 0));
                this.branchName = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _branchName_initializers, void 0));
                this.branchAddress = (__runInitializers(this, _branchName_extraInitializers), __runInitializers(this, _branchAddress_initializers, void 0));
                this.ownerName = (__runInitializers(this, _branchAddress_extraInitializers), __runInitializers(this, _ownerName_initializers, void 0));
                this.password = (__runInitializers(this, _ownerName_extraInitializers), __runInitializers(this, _password_initializers, void 0));
                __runInitializers(this, _password_extraInitializers);
            }
            return CreateTenantDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _businessType_decorators = [(0, class_validator_1.IsIn)(Object.keys(domain_1.businessTypeConfigs))];
            _phone_decorators = [(0, class_validator_1.Matches)(/^(?:\+?88)?01[3-9]\d{8}$/)];
            _email_decorators = [(0, class_validator_1.IsEmail)()];
            _branchName_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _branchAddress_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _ownerName_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _password_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(8)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _businessType_decorators, { kind: "field", name: "businessType", static: false, private: false, access: { has: function (obj) { return "businessType" in obj; }, get: function (obj) { return obj.businessType; }, set: function (obj, value) { obj.businessType = value; } }, metadata: _metadata }, _businessType_initializers, _businessType_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _branchName_decorators, { kind: "field", name: "branchName", static: false, private: false, access: { has: function (obj) { return "branchName" in obj; }, get: function (obj) { return obj.branchName; }, set: function (obj, value) { obj.branchName = value; } }, metadata: _metadata }, _branchName_initializers, _branchName_extraInitializers);
            __esDecorate(null, null, _branchAddress_decorators, { kind: "field", name: "branchAddress", static: false, private: false, access: { has: function (obj) { return "branchAddress" in obj; }, get: function (obj) { return obj.branchAddress; }, set: function (obj, value) { obj.branchAddress = value; } }, metadata: _metadata }, _branchAddress_initializers, _branchAddress_extraInitializers);
            __esDecorate(null, null, _ownerName_decorators, { kind: "field", name: "ownerName", static: false, private: false, access: { has: function (obj) { return "ownerName" in obj; }, get: function (obj) { return obj.ownerName; }, set: function (obj, value) { obj.ownerName = value; } }, metadata: _metadata }, _ownerName_initializers, _ownerName_extraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: function (obj) { return "password" in obj; }, get: function (obj) { return obj.password; }, set: function (obj, value) { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateTenantDto = CreateTenantDto;
