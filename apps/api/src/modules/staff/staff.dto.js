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
exports.CreateStaffDto = void 0;
var class_validator_1 = require("class-validator");
var CreateStaffDto = function () {
    var _a;
    var _employeeNo_decorators;
    var _employeeNo_initializers = [];
    var _employeeNo_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _branchId_decorators;
    var _branchId_initializers = [];
    var _branchId_extraInitializers = [];
    var _role_decorators;
    var _role_initializers = [];
    var _role_extraInitializers = [];
    var _shift_decorators;
    var _shift_initializers = [];
    var _shift_extraInitializers = [];
    var _salary_decorators;
    var _salary_initializers = [];
    var _salary_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateStaffDto() {
                this.employeeNo = __runInitializers(this, _employeeNo_initializers, void 0);
                this.name = (__runInitializers(this, _employeeNo_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.phone = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.branchId = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _branchId_initializers, void 0));
                this.role = (__runInitializers(this, _branchId_extraInitializers), __runInitializers(this, _role_initializers, void 0));
                this.shift = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _shift_initializers, void 0));
                this.salary = (__runInitializers(this, _shift_extraInitializers), __runInitializers(this, _salary_initializers, void 0));
                __runInitializers(this, _salary_extraInitializers);
            }
            return CreateStaffDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _employeeNo_decorators = [(0, class_validator_1.IsString)()];
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _phone_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.Matches)(/^(?:\+?88)?01[3-9]\d{8}$/)];
            _branchId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _role_decorators = [(0, class_validator_1.IsString)()];
            _shift_decorators = [(0, class_validator_1.IsString)()];
            _salary_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _employeeNo_decorators, { kind: "field", name: "employeeNo", static: false, private: false, access: { has: function (obj) { return "employeeNo" in obj; }, get: function (obj) { return obj.employeeNo; }, set: function (obj, value) { obj.employeeNo = value; } }, metadata: _metadata }, _employeeNo_initializers, _employeeNo_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: function (obj) { return "branchId" in obj; }, get: function (obj) { return obj.branchId; }, set: function (obj, value) { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: function (obj) { return "role" in obj; }, get: function (obj) { return obj.role; }, set: function (obj, value) { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _shift_decorators, { kind: "field", name: "shift", static: false, private: false, access: { has: function (obj) { return "shift" in obj; }, get: function (obj) { return obj.shift; }, set: function (obj, value) { obj.shift = value; } }, metadata: _metadata }, _shift_initializers, _shift_extraInitializers);
            __esDecorate(null, null, _salary_decorators, { kind: "field", name: "salary", static: false, private: false, access: { has: function (obj) { return "salary" in obj; }, get: function (obj) { return obj.salary; }, set: function (obj, value) { obj.salary = value; } }, metadata: _metadata }, _salary_initializers, _salary_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateStaffDto = CreateStaffDto;
