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
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const http_proxy_1 = __importDefault(require("http-proxy"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const file_routes_1 = __importDefault(require("./routes/file.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const sandbox_routes_1 = __importDefault(require("./routes/sandbox.routes"));
const user_model_1 = __importDefault(require("./models/user.model"));
const db_1 = require("./utils/db");
const mongoose_1 = require("mongoose");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const proxy = http_proxy_1.default.createProxyServer();
proxy.setMaxListeners(20); // Increase the limit of listeners
const PORT = process.env.PORT || 8080;
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const hostname = req.hostname;
    const domain = "shubhamvscode.online";
    const subdomain = hostname.replace(`.${domain}`, "");
    const appDomain = "app";
    if (!hostname.includes(domain) ||
        hostname === domain ||
        subdomain === "localhost" ||
        subdomain === appDomain) {
        return next();
    }
    console.log(`Request for ${subdomain}`);
    if (subdomain) {
        try {
            const user = yield user_model_1.default.findOne({ containerName: subdomain });
            if (!user)
                return res.status(404).json({ message: "Not found" });
            console.log(`User Container Name: ${user.containerName}`);
            const { containerPort } = user;
            const target = `http://localhost:${containerPort}`;
            console.log(`Forwarding request to ${target}`);
            return (0, http_proxy_middleware_1.createProxyMiddleware)({ target, changeOrigin: true, ws: true })(req, res, next);
        }
        catch (err) {
            return next(err);
        }
    }
    else {
        return next();
    }
}));
app.get("/health", (req, res) => {
    res.json({ message: "Healthy!" });
});
app.use("/user", user_routes_1.default);
app.use("/file", file_routes_1.default);
app.use("/sandbox", sandbox_routes_1.default);
server.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
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
server.on("upgrade", (req, socket, head) => __awaiter(void 0, void 0, void 0, function* () {
    const hostname = req.headers.host;
    const domain = "shubhamvscode.online";
    const subdomain = hostname === null || hostname === void 0 ? void 0 : hostname.replace(`.${domain}`, "");
    const appDomain = "app";
    if (!(hostname === null || hostname === void 0 ? void 0 : hostname.includes(domain)) ||
        hostname === domain ||
        subdomain === "localhost" ||
        subdomain === appDomain) {
        socket.destroy();
        return;
    }
    console.log(`WebSocket request for ${subdomain}`);
    if (subdomain) {
        try {
            const user = yield user_model_1.default.findOne({ containerName: subdomain });
            if (!user) {
                socket.destroy();
                return;
            }
            console.log(`User Container Name: ${user.containerName}`);
            const { containerPort } = user;
            const target = `ws://localhost:${containerPort}`;
            console.log(`Forwarding WebSocket request to ${target}`);
            proxy.ws(req, socket, head, { target, changeOrigin: true }, (err) => {
                console.error(err.message);
                socket.end("Bad Gateway");
            });
        }
        catch (err) {
            // console.error(err.message);
            socket.end("Bad Gateway");
        }
    }
    else {
        socket.destroy();
    }
}));
