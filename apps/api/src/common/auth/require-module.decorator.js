"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireModule = exports.MODULE_KEY = void 0;
var common_1 = require("@nestjs/common");
exports.MODULE_KEY = "requiredModule";
var RequireModule = function (moduleId) { return (0, common_1.SetMetadata)(exports.MODULE_KEY, moduleId); };
exports.RequireModule = RequireModule;
