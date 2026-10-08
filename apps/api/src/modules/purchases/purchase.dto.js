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
exports.ReceivePurchaseDto = void 0;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var PurchaseItemDto = function () {
    var _a;
    var _productId_decorators;
    var _productId_initializers = [];
    var _productId_extraInitializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _quantity_extraInitializers = [];
    var _unitCost_decorators;
    var _unitCost_initializers = [];
    var _unitCost_extraInitializers = [];
    var _batchNo_decorators;
    var _batchNo_initializers = [];
    var _batchNo_extraInitializers = [];
    var _expiryDate_decorators;
    var _expiryDate_initializers = [];
    var _expiryDate_extraInitializers = [];
    return _a = /** @class */ (function () {
            function PurchaseItemDto() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.quantity = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.unitCost = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unitCost_initializers, void 0));
                this.batchNo = (__runInitializers(this, _unitCost_extraInitializers), __runInitializers(this, _batchNo_initializers, void 0));
                this.expiryDate = (__runInitializers(this, _batchNo_extraInitializers), __runInitializers(this, _expiryDate_initializers, void 0));
                __runInitializers(this, _expiryDate_extraInitializers);
            }
            return PurchaseItemDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, class_validator_1.IsString)()];
            _quantity_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.001)];
            _unitCost_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _batchNo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _expiryDate_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: function (obj) { return "productId" in obj; }, get: function (obj) { return obj.productId; }, set: function (obj, value) { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unitCost_decorators, { kind: "field", name: "unitCost", static: false, private: false, access: { has: function (obj) { return "unitCost" in obj; }, get: function (obj) { return obj.unitCost; }, set: function (obj, value) { obj.unitCost = value; } }, metadata: _metadata }, _unitCost_initializers, _unitCost_extraInitializers);
            __esDecorate(null, null, _batchNo_decorators, { kind: "field", name: "batchNo", static: false, private: false, access: { has: function (obj) { return "batchNo" in obj; }, get: function (obj) { return obj.batchNo; }, set: function (obj, value) { obj.batchNo = value; } }, metadata: _metadata }, _batchNo_initializers, _batchNo_extraInitializers);
            __esDecorate(null, null, _expiryDate_decorators, { kind: "field", name: "expiryDate", static: false, private: false, access: { has: function (obj) { return "expiryDate" in obj; }, get: function (obj) { return obj.expiryDate; }, set: function (obj, value) { obj.expiryDate = value; } }, metadata: _metadata }, _expiryDate_initializers, _expiryDate_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
var ReceivePurchaseDto = function () {
    var _a;
    var _branchId_decorators;
    var _branchId_initializers = [];
    var _branchId_extraInitializers = [];
    var _supplierId_decorators;
    var _supplierId_initializers = [];
    var _supplierId_extraInitializers = [];
    var _invoiceNo_decorators;
    var _invoiceNo_initializers = [];
    var _invoiceNo_extraInitializers = [];
    var _paid_decorators;
    var _paid_initializers = [];
    var _paid_extraInitializers = [];
    var _items_decorators;
    var _items_initializers = [];
    var _items_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ReceivePurchaseDto() {
                this.branchId = __runInitializers(this, _branchId_initializers, void 0);
                this.supplierId = (__runInitializers(this, _branchId_extraInitializers), __runInitializers(this, _supplierId_initializers, void 0));
                this.invoiceNo = (__runInitializers(this, _supplierId_extraInitializers), __runInitializers(this, _invoiceNo_initializers, void 0));
                this.paid = (__runInitializers(this, _invoiceNo_extraInitializers), __runInitializers(this, _paid_initializers, void 0));
                this.items = (__runInitializers(this, _paid_extraInitializers), __runInitializers(this, _items_initializers, void 0));
                __runInitializers(this, _items_extraInitializers);
            }
            return ReceivePurchaseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _branchId_decorators = [(0, class_validator_1.IsString)()];
            _supplierId_decorators = [(0, class_validator_1.IsString)()];
            _invoiceNo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _paid_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _items_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return PurchaseItemDto; })];
            __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: function (obj) { return "branchId" in obj; }, get: function (obj) { return obj.branchId; }, set: function (obj, value) { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
            __esDecorate(null, null, _supplierId_decorators, { kind: "field", name: "supplierId", static: false, private: false, access: { has: function (obj) { return "supplierId" in obj; }, get: function (obj) { return obj.supplierId; }, set: function (obj, value) { obj.supplierId = value; } }, metadata: _metadata }, _supplierId_initializers, _supplierId_extraInitializers);
            __esDecorate(null, null, _invoiceNo_decorators, { kind: "field", name: "invoiceNo", static: false, private: false, access: { has: function (obj) { return "invoiceNo" in obj; }, get: function (obj) { return obj.invoiceNo; }, set: function (obj, value) { obj.invoiceNo = value; } }, metadata: _metadata }, _invoiceNo_initializers, _invoiceNo_extraInitializers);
            __esDecorate(null, null, _paid_decorators, { kind: "field", name: "paid", static: false, private: false, access: { has: function (obj) { return "paid" in obj; }, get: function (obj) { return obj.paid; }, set: function (obj, value) { obj.paid = value; } }, metadata: _metadata }, _paid_initializers, _paid_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: function (obj) { return "items" in obj; }, get: function (obj) { return obj.items; }, set: function (obj, value) { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ReceivePurchaseDto = ReceivePurchaseDto;
