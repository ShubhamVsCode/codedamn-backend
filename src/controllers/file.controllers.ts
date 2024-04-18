import { Request, Response } from "express";
import { z } from "zod";
import { fileZodSchema } from "../zod/file";
import FileModel from "../models/file.model";

export const getFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idAsString = z.string().parse(id);

    const file = await FileModel.findById(idAsString);

    if (!file) {
      return res.status(404).json({ error: "File not found", success: false });
    }

    res.status(200).json({ data: file, success: true });
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const files = await FileModel.find();
    res.status(200).json({ data: files, success: true });
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
};

export const createNewFile = async (req: Request, res: Response) => {
  try {
    const { file } = req.body;

    if (!file) {
      return res
        .status(400)
        .json({ error: "File is required", success: false });
    }

    const parsedFile = fileZodSchema.safeParse(file);

    if (!parsedFile.success) {
      return res.status(400).json({ error: parsedFile.error, success: false });
    }

    const newFile = {
      name: parsedFile.data.name,
      content: parsedFile.data.content,
      extension: parsedFile.data.extension,
    };

    const createdFile = await FileModel.create(newFile);

    if (!createdFile) {
      return res
        .status(500)
        .json({ error: "Failed to create new file", success: false });
    }

    res.status(201).json({ data: createdFile, success: true });
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
};

export const updateFile = async (req: Request, res: Response) => {
  try {
    const { file } = req.body;

    const parsedFile = fileZodSchema.safeParse(file);
    const idAsString = z.string().parse(file?._id);

    if (!parsedFile.success) {
      return res.status(400).json({ error: parsedFile.error, success: false });
    }

    const updatedFile = {
      name: parsedFile.data.name,
      content: parsedFile.data.content,
      extension: parsedFile.data.extension,
    };

    const updated = await FileModel.findByIdAndUpdate(idAsString, updatedFile, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "File not found", success: false });
    }

    res.status(200).json({ data: updated, success: true });
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { _id } = req.body;

    const idAsString = z.string().parse(_id);

    const deleted = await FileModel.findByIdAndDelete(idAsString);

    if (!deleted) {
      return res.status(404).json({ error: "File not found", success: false });
    }

    res.status(200).json({ data: deleted, success: true });
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
};
