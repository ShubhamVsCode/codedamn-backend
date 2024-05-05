"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrGetUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const createOrGetUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res
                .status(400)
                .json({ error: "Email is required", success: false });
        }
        const existingUser = yield user_model_1.default.findOne({ email });
        let user;
        if (existingUser) {
            user = existingUser;
        }
        else {
            user = yield user_model_1.default.create({ email });
        }
        console.log(user);
        res.status(200).json({ data: user, success: true });
    }
    catch (error) {
        res.status(500).json({ error, success: false });
    }
});
exports.createOrGetUser = createOrGetUser;
