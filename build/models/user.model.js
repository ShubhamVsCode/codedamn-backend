"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
exports.UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isSandboxRunning: {
        type: Boolean,
        default: false,
    },
});
const UserModel = (0, mongoose_1.model)("User", exports.UserSchema);
exports.default = UserModel;
