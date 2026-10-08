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
exports.CreateProductDto = void 0;
var class_validator_1 = require("class-validator");
var CreateProductDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _sku_decorators;
    var _sku_initializers = [];
    var _sku_extraInitializers = [];
    var _barcode_decorators;
    var _barcode_initializers = [];
    var _barcode_extraInitializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _brand_decorators;
    var _brand_initializers = [];
    var _brand_extraInitializers = [];
    var _purchasePrice_decorators;
    var _purchasePrice_initializers = [];
    var _purchasePrice_extraInitializers = [];
    var _salePrice_decorators;
    var _salePrice_initializers = [];
    var _salePrice_extraInitializers = [];
    var _unit_decorators;
    var _unit_initializers = [];
    var _unit_extraInitializers = [];
    var _stock_decorators;
    var _stock_initializers = [];
    var _stock_extraInitializers = [];
    var _minimumStock_decorators;
    var _minimumStock_initializers = [];
    var _minimumStock_extraInitializers = [];
    var _featured_decorators;
    var _featured_initializers = [];
    var _featured_extraInitializers = [];
    var _attributes_decorators;
    var _attributes_initializers = [];
    var _attributes_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateProductDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.sku = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _sku_initializers, void 0));
                this.barcode = (__runInitializers(this, _sku_extraInitializers), __runInitializers(this, _barcode_initializers, void 0));
                this.category = (__runInitializers(this, _barcode_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.brand = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _brand_initializers, void 0));
                this.purchasePrice = (__runInitializers(this, _brand_extraInitializers), __runInitializers(this, _purchasePrice_initializers, void 0));
                this.salePrice = (__runInitializers(this, _purchasePrice_extraInitializers), __runInitializers(this, _salePrice_initializers, void 0));
                this.unit = (__runInitializers(this, _salePrice_extraInitializers), __runInitializers(this, _unit_initializers, void 0));
                this.stock = (__runInitializers(this, _unit_extraInitializers), __runInitializers(this, _stock_initializers, void 0));
                this.minimumStock = (__runInitializers(this, _stock_extraInitializers), __runInitializers(this, _minimumStock_initializers, void 0));
                this.featured = (__runInitializers(this, _minimumStock_extraInitializers), __runInitializers(this, _featured_initializers, void 0));
                this.attributes = (__runInitializers(this, _featured_extraInitializers), __runInitializers(this, _attributes_initializers, void 0));
                __runInitializers(this, _attributes_extraInitializers);
            }
            return CreateProductDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _sku_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _barcode_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _category_decorators = [(0, class_validator_1.IsString)()];
            _brand_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _purchasePrice_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _salePrice_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _unit_decorators = [(0, class_validator_1.IsString)()];
            _stock_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _minimumStock_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _featured_decorators = [(0, class_validator_1.IsBoolean)()];
            _attributes_decorators = [(0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: function (obj) { return "sku" in obj; }, get: function (obj) { return obj.sku; }, set: function (obj, value) { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
            __esDecorate(null, null, _barcode_decorators, { kind: "field", name: "barcode", static: false, private: false, access: { has: function (obj) { return "barcode" in obj; }, get: function (obj) { return obj.barcode; }, set: function (obj, value) { obj.barcode = value; } }, metadata: _metadata }, _barcode_initializers, _barcode_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _brand_decorators, { kind: "field", name: "brand", static: false, private: false, access: { has: function (obj) { return "brand" in obj; }, get: function (obj) { return obj.brand; }, set: function (obj, value) { obj.brand = value; } }, metadata: _metadata }, _brand_initializers, _brand_extraInitializers);
            __esDecorate(null, null, _purchasePrice_decorators, { kind: "field", name: "purchasePrice", static: false, private: false, access: { has: function (obj) { return "purchasePrice" in obj; }, get: function (obj) { return obj.purchasePrice; }, set: function (obj, value) { obj.purchasePrice = value; } }, metadata: _metadata }, _purchasePrice_initializers, _purchasePrice_extraInitializers);
            __esDecorate(null, null, _salePrice_decorators, { kind: "field", name: "salePrice", static: false, private: false, access: { has: function (obj) { return "salePrice" in obj; }, get: function (obj) { return obj.salePrice; }, set: function (obj, value) { obj.salePrice = value; } }, metadata: _metadata }, _salePrice_initializers, _salePrice_extraInitializers);
            __esDecorate(null, null, _unit_decorators, { kind: "field", name: "unit", static: false, private: false, access: { has: function (obj) { return "unit" in obj; }, get: function (obj) { return obj.unit; }, set: function (obj, value) { obj.unit = value; } }, metadata: _metadata }, _unit_initializers, _unit_extraInitializers);
            __esDecorate(null, null, _stock_decorators, { kind: "field", name: "stock", static: false, private: false, access: { has: function (obj) { return "stock" in obj; }, get: function (obj) { return obj.stock; }, set: function (obj, value) { obj.stock = value; } }, metadata: _metadata }, _stock_initializers, _stock_extraInitializers);
            __esDecorate(null, null, _minimumStock_decorators, { kind: "field", name: "minimumStock", static: false, private: false, access: { has: function (obj) { return "minimumStock" in obj; }, get: function (obj) { return obj.minimumStock; }, set: function (obj, value) { obj.minimumStock = value; } }, metadata: _metadata }, _minimumStock_initializers, _minimumStock_extraInitializers);
            __esDecorate(null, null, _featured_decorators, { kind: "field", name: "featured", static: false, private: false, access: { has: function (obj) { return "featured" in obj; }, get: function (obj) { return obj.featured; }, set: function (obj, value) { obj.featured = value; } }, metadata: _metadata }, _featured_initializers, _featured_extraInitializers);
            __esDecorate(null, null, _attributes_decorators, { kind: "field", name: "attributes", static: false, private: false, access: { has: function (obj) { return "attributes" in obj; }, get: function (obj) { return obj.attributes; }, set: function (obj, value) { obj.attributes = value; } }, metadata: _metadata }, _attributes_initializers, _attributes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateProductDto = CreateProductDto;
