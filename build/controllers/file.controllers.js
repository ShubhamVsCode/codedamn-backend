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
exports.deleteFile = exports.updateFile = exports.createNewFile = exports.getFiles = exports.getFile = void 0;
const zod_1 = require("zod");
const file_1 = require("../zod/file");
const file_model_1 = __importDefault(require("../models/file.model"));
const getFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idAsString = zod_1.z.string().parse(id);
        const file = yield file_model_1.default.findById(idAsString);
        if (!file) {
            return res.status(404).json({ error: "File not found", success: false });
        }
        res.status(200).json({ data: file, success: true });
    }
    catch (error) {
        res.status(500).json({ error, success: false });
    }
});
exports.getFile = getFile;
const getFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield file_model_1.default.find();
        res.status(200).json({ data: files, success: true });
    }
    catch (error) {
        res.status(500).json({ error, success: false });
    }
});
exports.getFiles = getFiles;
const createNewFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { file } = req.body;
        if (!file) {
            return res
                .status(400)
                .json({ error: "File is required", success: false });
        }
        const parsedFile = file_1.fileZodSchema.safeParse(file);
        if (!parsedFile.success) {
            return res.status(400).json({ error: parsedFile.error, success: false });
        }
        const newFile = {
            name: parsedFile.data.name,
            content: parsedFile.data.content,
            extension: parsedFile.data.extension,
        };
        const createdFile = yield file_model_1.default.create(newFile);
        if (!createdFile) {
            return res
                .status(500)
                .json({ error: "Failed to create new file", success: false });
        }
        res.status(201).json({ data: createdFile, success: true });
    }
    catch (error) {
        res.status(500).json({ error, success: false });
    }
});
exports.createNewFile = createNewFile;
const updateFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { file } = req.body;
        const parsedFile = file_1.fileZodSchema.safeParse(file);
        const idAsString = zod_1.z.string().parse(file === null || file === void 0 ? void 0 : file._id);
        if (!parsedFile.success) {
            return res.status(400).json({ error: parsedFile.error, success: false });
        }
        const updatedFile = {
            name: parsedFile.data.name,
            content: parsedFile.data.content,
            extension: parsedFile.data.extension,
        };
        const updated = yield file_model_1.default.findByIdAndUpdate(idAsString, updatedFile, {
            new: true,
        });
        if (!updated) {
            return res.status(404).json({ error: "File not found", success: false });
        }
        res.status(200).json({ data: updated, success: true });
    }
    catch (error) {
        res.status(500).json({ error, success: false });
    }
});
exports.updateFile = updateFile;
const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        const idAsString = zod_1.z.string().parse(_id);
        const deleted = yield file_model_1.default.findByIdAndDelete(idAsString);
        if (!deleted) {
            return res.status(404).json({ error: "File not found", success: false });
        }
        res.status(200).json({ data: deleted, success: true });
    }
    catch (error) {
        res.status(500).json({ error, success: false });
    }
});
exports.deleteFile = deleteFile;
