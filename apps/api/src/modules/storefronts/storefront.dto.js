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
exports.UpdateStorefrontDto = exports.StorefrontSectionDto = void 0;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var StorefrontSectionDto = function () {
    var _a;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _subtitle_decorators;
    var _subtitle_initializers = [];
    var _subtitle_extraInitializers = [];
    var _visible_decorators;
    var _visible_initializers = [];
    var _visible_extraInitializers = [];
    return _a = /** @class */ (function () {
            function StorefrontSectionDto() {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.type = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.title = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _title_initializers, void 0));
                this.subtitle = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _subtitle_initializers, void 0));
                this.visible = (__runInitializers(this, _subtitle_extraInitializers), __runInitializers(this, _visible_initializers, void 0));
                __runInitializers(this, _visible_extraInitializers);
            }
            return StorefrontSectionDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, class_validator_1.IsString)()];
            _type_decorators = [(0, class_validator_1.IsString)()];
            _title_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(100)];
            _subtitle_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(240)];
            _visible_decorators = [(0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _subtitle_decorators, { kind: "field", name: "subtitle", static: false, private: false, access: { has: function (obj) { return "subtitle" in obj; }, get: function (obj) { return obj.subtitle; }, set: function (obj, value) { obj.subtitle = value; } }, metadata: _metadata }, _subtitle_initializers, _subtitle_extraInitializers);
            __esDecorate(null, null, _visible_decorators, { kind: "field", name: "visible", static: false, private: false, access: { has: function (obj) { return "visible" in obj; }, get: function (obj) { return obj.visible; }, set: function (obj, value) { obj.visible = value; } }, metadata: _metadata }, _visible_initializers, _visible_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.StorefrontSectionDto = StorefrontSectionDto;
var UpdateStorefrontDto = function () {
    var _a;
    var _slug_decorators;
    var _slug_initializers = [];
    var _slug_extraInitializers = [];
    var _heroTitle_decorators;
    var _heroTitle_initializers = [];
    var _heroTitle_extraInitializers = [];
    var _tagline_decorators;
    var _tagline_initializers = [];
    var _tagline_extraInitializers = [];
    var _theme_decorators;
    var _theme_initializers = [];
    var _theme_extraInitializers = [];
    var _primaryColor_decorators;
    var _primaryColor_initializers = [];
    var _primaryColor_extraInitializers = [];
    var _deliveryEnabled_decorators;
    var _deliveryEnabled_initializers = [];
    var _deliveryEnabled_extraInitializers = [];
    var _pickupEnabled_decorators;
    var _pickupEnabled_initializers = [];
    var _pickupEnabled_extraInitializers = [];
    var _sections_decorators;
    var _sections_initializers = [];
    var _sections_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateStorefrontDto() {
                this.slug = __runInitializers(this, _slug_initializers, void 0);
                this.heroTitle = (__runInitializers(this, _slug_extraInitializers), __runInitializers(this, _heroTitle_initializers, void 0));
                this.tagline = (__runInitializers(this, _heroTitle_extraInitializers), __runInitializers(this, _tagline_initializers, void 0));
                this.theme = (__runInitializers(this, _tagline_extraInitializers), __runInitializers(this, _theme_initializers, void 0));
                this.primaryColor = (__runInitializers(this, _theme_extraInitializers), __runInitializers(this, _primaryColor_initializers, void 0));
                this.deliveryEnabled = (__runInitializers(this, _primaryColor_extraInitializers), __runInitializers(this, _deliveryEnabled_initializers, void 0));
                this.pickupEnabled = (__runInitializers(this, _deliveryEnabled_extraInitializers), __runInitializers(this, _pickupEnabled_initializers, void 0));
                this.sections = (__runInitializers(this, _pickupEnabled_extraInitializers), __runInitializers(this, _sections_initializers, void 0));
                __runInitializers(this, _sections_extraInitializers);
            }
            return UpdateStorefrontDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _slug_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.Matches)(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)];
            _heroTitle_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _tagline_decorators = [(0, class_validator_1.IsString)()];
            _theme_decorators = [(0, class_validator_1.IsString)()];
            _primaryColor_decorators = [(0, class_validator_1.IsHexColor)()];
            _deliveryEnabled_decorators = [(0, class_validator_1.IsBoolean)()];
            _pickupEnabled_decorators = [(0, class_validator_1.IsBoolean)()];
            _sections_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return StorefrontSectionDto; })];
            __esDecorate(null, null, _slug_decorators, { kind: "field", name: "slug", static: false, private: false, access: { has: function (obj) { return "slug" in obj; }, get: function (obj) { return obj.slug; }, set: function (obj, value) { obj.slug = value; } }, metadata: _metadata }, _slug_initializers, _slug_extraInitializers);
            __esDecorate(null, null, _heroTitle_decorators, { kind: "field", name: "heroTitle", static: false, private: false, access: { has: function (obj) { return "heroTitle" in obj; }, get: function (obj) { return obj.heroTitle; }, set: function (obj, value) { obj.heroTitle = value; } }, metadata: _metadata }, _heroTitle_initializers, _heroTitle_extraInitializers);
            __esDecorate(null, null, _tagline_decorators, { kind: "field", name: "tagline", static: false, private: false, access: { has: function (obj) { return "tagline" in obj; }, get: function (obj) { return obj.tagline; }, set: function (obj, value) { obj.tagline = value; } }, metadata: _metadata }, _tagline_initializers, _tagline_extraInitializers);
            __esDecorate(null, null, _theme_decorators, { kind: "field", name: "theme", static: false, private: false, access: { has: function (obj) { return "theme" in obj; }, get: function (obj) { return obj.theme; }, set: function (obj, value) { obj.theme = value; } }, metadata: _metadata }, _theme_initializers, _theme_extraInitializers);
            __esDecorate(null, null, _primaryColor_decorators, { kind: "field", name: "primaryColor", static: false, private: false, access: { has: function (obj) { return "primaryColor" in obj; }, get: function (obj) { return obj.primaryColor; }, set: function (obj, value) { obj.primaryColor = value; } }, metadata: _metadata }, _primaryColor_initializers, _primaryColor_extraInitializers);
            __esDecorate(null, null, _deliveryEnabled_decorators, { kind: "field", name: "deliveryEnabled", static: false, private: false, access: { has: function (obj) { return "deliveryEnabled" in obj; }, get: function (obj) { return obj.deliveryEnabled; }, set: function (obj, value) { obj.deliveryEnabled = value; } }, metadata: _metadata }, _deliveryEnabled_initializers, _deliveryEnabled_extraInitializers);
            __esDecorate(null, null, _pickupEnabled_decorators, { kind: "field", name: "pickupEnabled", static: false, private: false, access: { has: function (obj) { return "pickupEnabled" in obj; }, get: function (obj) { return obj.pickupEnabled; }, set: function (obj, value) { obj.pickupEnabled = value; } }, metadata: _metadata }, _pickupEnabled_initializers, _pickupEnabled_extraInitializers);
            __esDecorate(null, null, _sections_decorators, { kind: "field", name: "sections", static: false, private: false, access: { has: function (obj) { return "sections" in obj; }, get: function (obj) { return obj.sections; }, set: function (obj, value) { obj.sections = value; } }, metadata: _metadata }, _sections_initializers, _sections_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateStorefrontDto = UpdateStorefrontDto;
