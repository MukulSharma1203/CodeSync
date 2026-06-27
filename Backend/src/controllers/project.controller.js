import { FileFolder } from "../models/fileFolder.model.js";
import { getIO, getLiveFiles } from "../utils/socket.js";

//createFolder
export const createFolder = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectId = req.project._id;
    const { name } = req.body;
    const { parentFolderId } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "folder name is needed",
      });
    }

    let parentFolder = null;

    if (parentFolderId !== "root") {
      parentFolder = await FileFolder.findOne({
        _id: parentFolderId,
        project: projectId,
        type: "folder",
      });

      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          message: "Parent Folder not found",
        });
      }
    }

    const existingFolder = await FileFolder.findOne({
      name,
      project: projectId,
      parent: parentFolder ? parentFolder._id : null,
    });
    if (existingFolder) {
      return res.status(409).json({
        success: false,
        message: "Folder already exist in this location",
      });
    }

    const folder = await FileFolder.create({
      name,
      type: "folder",
      parent: parentFolder ? parentFolder._id : null,
      project: projectId,
      createdBy: userId,
    });
    
    getIO().to(projectId.toString()).emit("folder-created", folder);

    return res.status(201).json({
      success: true,
      message: "Folder created successfully",
      folder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//createFile
export const createFile = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectId = req.project._id;
    const { name, language, content } = req.body;
    const { parentFolderId } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "file name is needed",
      });
    }

    let parentFolder = null;

    if (parentFolderId !== "root") {
      parentFolder = await FileFolder.findOne({
        _id: parentFolderId,
        project: projectId,
        type: "folder",
      });

      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          message: "Parent Folder not found",
        });
      }
    }

    const existingFile = await FileFolder.findOne({
      name,
      project: projectId,
      parent: parentFolder ? parentFolder._id : null,
    });

    if (existingFile) {
      return res.status(409).json({
        success: false,
        message: "File already exists in this location",
      });
    }

    const file = await FileFolder.create({
      name,
      type: "file",
      parent: parentFolder ? parentFolder._id : null,
      project: projectId,
      language: language || null,
      createdBy: userId,
    });
    
    getIO().to(projectId.toString()).emit("file-created", file);

    return res.status(201).json({
      success: true,
      message: "File created successfully",
      file,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//rename file folder
export const renameFileFolder = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectId = req.project._id;
    const { fileId } = req.params;
    const { newName, language } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "fileId is required",
      });
    }

    if (!newName) {
      return res.status(400).json({
        success: false,
        message: "newName is required",
      });
    }

    const fileFolder = await FileFolder.findOne({
      _id: fileId,
      project: projectId,
    });

    if (!fileFolder) {
      return res.status(404).json({
        success: false,
        message: "File/Folder not found",
      });
    }

    const existingItem = await FileFolder.findOne({
      _id: { $ne: fileId },
      project: projectId,
      parent: fileFolder.parent,
      name: newName,
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: "An item with this name already exists in this location",
      });
    }

    fileFolder.name = newName;

    if (fileFolder.type === "file" && language !== undefined) {
      fileFolder.language = language;
    }

    await fileFolder.save();
    
    getIO().to(projectId.toString()).emit("item-renamed", fileFolder);

    return res.status(200).json({
      success: true,
      message: "Renamed successfully",
      fileFolder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//delete file folder
export const deleteFileFolder = async (req, res) => {
  try {
    const projectId = req.project._id;
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "fileId is required",
      });
    }

    const target = await FileFolder.findOne({
      _id: fileId,
      project: projectId,
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "File/Folder not found",
      });
    }

    const deleteChildrenRecursively = async (parentId) => {
      const children = await FileFolder.find({
        parent: parentId,
        project: projectId,
      });

      for (const child of children) {
        await deleteChildrenRecursively(child._id);
      }

      await FileFolder.deleteMany({
        parent: parentId,
        project: projectId,
      });
    };

    await deleteChildrenRecursively(target._id);

    await FileFolder.deleteOne({
      _id: target._id,
      project: projectId,
    });
    
    getIO().to(projectId.toString()).emit("item-deleted", {
      _id: target._id,
    });

    return res.status(200).json({
      success: true,
      message: "File/Folder deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//folder tree
export const getFolderTree = async (req, res) => {
  try {
    const projectId = req.project._id;

    const nodes = await FileFolder.find({ project: projectId })
      .select("-content") // keep tree payload light
      .sort({ type: 1, name: 1, createdAt: 1 })
      .lean();

    const nodeMap = new Map();
    for (const node of nodes) {
      nodeMap.set(node._id.toString(), {
        ...node,
        children: [],
      });
    }

    const tree = [];
    for (const node of nodes) {
      const current = nodeMap.get(node._id.toString());
      const parentId = node.parent ? node.parent.toString() : null;

      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId).children.push(current);
      } else {
        tree.push(current);
      }
    }

    return res.status(200).json({
      success: true,
      tree,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//file content
export const getFileContent = async (req, res) => {
  try {
    const projectId = req.project._id;
    const fileId = req.params.fileId;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "fileId is required",
      });
    }

    const file = await FileFolder.findOne({
      _id: fileId,
      project: projectId,
      type: "file",
    }).select("name content language parent project updatedAt");

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const liveFiles = getLiveFiles();

    if (liveFiles.has(fileId)) {
      file.content = liveFiles.get(fileId);
    }

    return res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//save file
export const saveFileContent = async (req, res) => {
  try {
    const projectId = req.project._id;
    const { content, language } = req.body;
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "fileId is required",
      });
    }

    if (content === undefined) {
      return res.status(400).json({
        success: false,
        message: "content is required",
      });
    }

    const file = await FileFolder.findOne({
      _id: fileId,
      project: projectId,
      type: "file",
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    file.content = content;
    if (language !== undefined) {
      file.language = language;
    }

    await file.save();
    
    getIO().to(projectId.toString()).emit("file-saved", {
      _id: file._id,
      content: file.content,
      language: file.language,
    });

    return res.status(200).json({
      success: true,
      message: "File content saved successfully",
      file,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
