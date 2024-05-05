"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSchema = void 0;
const mongoose_1 = require("mongoose");
exports.FileSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    extension: {
        type: String,
        required: true,
    },
});
const FileModel = (0, mongoose_1.model)("File", exports.FileSchema);
exports.default = FileModel;
