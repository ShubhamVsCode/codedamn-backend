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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const file_routes_1 = __importDefault(require("./routes/file.routes"));
const db_1 = require("./utils/db");
const mongoose_1 = require("mongoose");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const sandbox_routes_1 = __importDefault(require("./routes/sandbox.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.get("/health", (req, res) => {
    res.json({ message: "Healthy!" });
});
app.use("/user", user_routes_1.default);
app.use("/file", file_routes_1.default);
app.use("/sandbox", sandbox_routes_1.default);
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server running on port ${PORT}`);
    try {
        yield (0, db_1.connectDb)();
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        else if (error instanceof mongoose_1.MongooseError) {
            console.error(error === null || error === void 0 ? void 0 : error.name);
        }
    }
}));
