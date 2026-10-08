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
exports.CreateOrderDto = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var CreateOrderItemDto = function () {
    var _a;
    var _productId_decorators;
    var _productId_initializers = [];
    var _productId_extraInitializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _quantity_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateOrderItemDto() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.quantity = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                __runInitializers(this, _quantity_extraInitializers);
            }
            return CreateOrderItemDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, class_validator_1.IsString)()];
            _quantity_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.001)];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: function (obj) { return "productId" in obj; }, get: function (obj) { return obj.productId; }, set: function (obj, value) { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
var CreateOrderDto = function () {
    var _a;
    var _branchId_decorators;
    var _branchId_initializers = [];
    var _branchId_extraInitializers = [];
    var _customerId_decorators;
    var _customerId_initializers = [];
    var _customerId_extraInitializers = [];
    var _source_decorators;
    var _source_initializers = [];
    var _source_extraInitializers = [];
    var _paymentMethod_decorators;
    var _paymentMethod_initializers = [];
    var _paymentMethod_extraInitializers = [];
    var _orderType_decorators;
    var _orderType_initializers = [];
    var _orderType_extraInitializers = [];
    var _discount_decorators;
    var _discount_initializers = [];
    var _discount_extraInitializers = [];
    var _paidAmount_decorators;
    var _paidAmount_initializers = [];
    var _paidAmount_extraInitializers = [];
    var _notes_decorators;
    var _notes_initializers = [];
    var _notes_extraInitializers = [];
    var _items_decorators;
    var _items_initializers = [];
    var _items_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateOrderDto() {
                this.branchId = __runInitializers(this, _branchId_initializers, void 0);
                this.customerId = (__runInitializers(this, _branchId_extraInitializers), __runInitializers(this, _customerId_initializers, void 0));
                this.source = (__runInitializers(this, _customerId_extraInitializers), __runInitializers(this, _source_initializers, void 0));
                this.paymentMethod = (__runInitializers(this, _source_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
                this.orderType = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _orderType_initializers, void 0));
                this.discount = (__runInitializers(this, _orderType_extraInitializers), __runInitializers(this, _discount_initializers, void 0));
                this.paidAmount = (__runInitializers(this, _discount_extraInitializers), __runInitializers(this, _paidAmount_initializers, void 0));
                this.notes = (__runInitializers(this, _paidAmount_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                this.items = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _items_initializers, void 0));
                __runInitializers(this, _items_extraInitializers);
            }
            return CreateOrderDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _branchId_decorators = [(0, class_validator_1.IsString)()];
            _customerId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _source_decorators = [(0, class_validator_1.IsString)()];
            _paymentMethod_decorators = [(0, class_validator_1.IsIn)(["Cash", "Card", "bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer", "Manual", "Due"])];
            _orderType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _discount_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _paidAmount_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _notes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(500)];
            _items_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return CreateOrderItemDto; })];
            __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: function (obj) { return "branchId" in obj; }, get: function (obj) { return obj.branchId; }, set: function (obj, value) { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
            __esDecorate(null, null, _customerId_decorators, { kind: "field", name: "customerId", static: false, private: false, access: { has: function (obj) { return "customerId" in obj; }, get: function (obj) { return obj.customerId; }, set: function (obj, value) { obj.customerId = value; } }, metadata: _metadata }, _customerId_initializers, _customerId_extraInitializers);
            __esDecorate(null, null, _source_decorators, { kind: "field", name: "source", static: false, private: false, access: { has: function (obj) { return "source" in obj; }, get: function (obj) { return obj.source; }, set: function (obj, value) { obj.source = value; } }, metadata: _metadata }, _source_initializers, _source_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: function (obj) { return "paymentMethod" in obj; }, get: function (obj) { return obj.paymentMethod; }, set: function (obj, value) { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _orderType_decorators, { kind: "field", name: "orderType", static: false, private: false, access: { has: function (obj) { return "orderType" in obj; }, get: function (obj) { return obj.orderType; }, set: function (obj, value) { obj.orderType = value; } }, metadata: _metadata }, _orderType_initializers, _orderType_extraInitializers);
            __esDecorate(null, null, _discount_decorators, { kind: "field", name: "discount", static: false, private: false, access: { has: function (obj) { return "discount" in obj; }, get: function (obj) { return obj.discount; }, set: function (obj, value) { obj.discount = value; } }, metadata: _metadata }, _discount_initializers, _discount_extraInitializers);
            __esDecorate(null, null, _paidAmount_decorators, { kind: "field", name: "paidAmount", static: false, private: false, access: { has: function (obj) { return "paidAmount" in obj; }, get: function (obj) { return obj.paidAmount; }, set: function (obj, value) { obj.paidAmount = value; } }, metadata: _metadata }, _paidAmount_initializers, _paidAmount_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: function (obj) { return "notes" in obj; }, get: function (obj) { return obj.notes; }, set: function (obj, value) { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: function (obj) { return "items" in obj; }, get: function (obj) { return obj.items; }, set: function (obj, value) { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateOrderDto = CreateOrderDto;
