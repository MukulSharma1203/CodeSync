import { Project } from "../models/project.model.js";
import { FileFolder } from "../models/fileFolder.model.js";

const generateCode = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let code = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
};

export const createProject = async (req, res) => {
  try {
    const { projectName, projectDesc } = req.body;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const userId = req.user._id;

    let inviteCode;
    let existingProject;

    do {
      inviteCode = generateCode();

      existingProject = await Project.findOne({
        inviteCode,
      });
    } while (existingProject);

    const project = await Project.create({
      projectName,
      projectDesc,
      inviteCode,
      createdBy: userId,
      collaborators: [
        {
          user: userId,
          role: "owner",
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Project Created Successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    //finding
    const isOwner = project.collaborators.some(
      (collaborator) =>
        collaborator.user.toString() === userId.toString() &&
        collaborator.role === "owner",
    );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only owner can delete project",
      });
    }

    //deleting
    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    let { projectName, projectDesc } = req.body;
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!projectName) {
      projectName = project.projectName;
    }
    if (projectDesc === undefined) {
      projectDesc = project.projectDesc;
    }

    //only owner can update project
    const isOwner = project.collaborators.some(
      (collaborator) =>
        collaborator.user.toString() === userId.toString() &&
        collaborator.role === "owner",
    );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only owner can Update project",
      });
    }

    await Project.findByIdAndUpdate(projectId, {
      projectName,
      projectDesc,
    });

    return res.status(200).json({
      success: true,
      message: "Update successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// join , leave , getprojects

//working
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      "collaborators.user": userId,
    })
      .populate("createdBy", "username avatar")
      .populate("collaborators.user", "username avatar");
    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//working

export const joinProject = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;
    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: "InviteCode not found",
      });
    }

    const project = await Project.findOneAndUpdate(
      { inviteCode },
      {
        $addToSet: {
          collaborators: {
            user: userId,
            role: "viewer",
          },
        },
      },
      { new: true },
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Joined project successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//working
export const leaveProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(404).json({
        success: false,
        message: "ProjectId Required",
      });
    }
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isOwner = project.collaborators.some(
      (collaborator) =>
        collaborator.user.toString() === userId.toString() &&
        collaborator.role === "owner",
    );

    if (isOwner) {
      return res.status(400).json({
        success: false,
        message: "Owner can't leave project. Delete the project instead.",
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $pull: {
          collaborators: {
            user: userId,
          },
        },
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Left project successfully",
      project: updatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//update role and delete collaborator

// working
export const deleteCollaborator = async (req, res) => {
  try {
    const { projectId, collaboratorId } = req.params;
    const userId = req.user._id;

    if (!projectId || !collaboratorId) {
      return res.status(404).json({
        success: false,
        message: "ProjectId and CollaboratorId are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    const isOwner = project.collaborators.some(
      (collaborator) =>
        collaborator.user.toString() === userId.toString() &&
        collaborator.role === "owner",
    );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access Denied - Only owner can delete collaborators",
      });
    }

    if (collaboratorId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Owner cannot delete himself",
      });
    }

    const targetCollaborator = await project.collaborators.find(
      (collaborator) =>
        collaborator.user.toString() === collaboratorId.toString(),
    );

    if (!targetCollaborator) {
      return res.status(404).json({
        success: false,
        message: "Collaborator not found",
      });
    }

    if (targetCollaborator.role === "owner") {
      return res.status(400).json({
        success: false,
        message: "Owner cannot be deleted",
      });
    } //feels redundent , but issokay

    project.collaborators = project.collaborators.filter(
      (collaborator) =>
        collaborator.user.toString() !== collaboratorId.toString(),
    );

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Collaborator deleted successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//working
export const updateCollaboratorRole = async (req, res) => {
  try {
    const { projectId, collaboratorId } = req.params;
    const { role } = req.body;
    const userId = req.user._id;

    if (!projectId || !collaboratorId) {
      return res.status(404).json({
        success: false,
        message: "ProjectId and CollaboratorId are required",
      });
    }

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role is required",
      });
    }

    if (!["viewer", "editor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Role -> choose from viewer or editor",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isOwner = project.collaborators.some(
      (collaborator) =>
        collaborator.user.toString() === userId.toString() &&
        collaborator.role === "owner",
    );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only owner can change collaborator roles",
      });
    }

    const targetCollaborator = project.collaborators.find(
      (collaborator) =>
        collaborator.user.toString() === collaboratorId.toString(),
    );

    if (!targetCollaborator) {
      return res.status(404).json({
        success: false,
        message: "Collaborator not found",
      });
    }

    if (targetCollaborator.role === "owner") {
      return res.status(400).json({
        success: false,
        message: "Owner role cannot be changed",
      });
    }

    targetCollaborator.role = role;
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Collaborator role updated successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//open project
export const openProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "ProjectId is required",
      });
    }

    const project = await Project.findById(projectId)
      .populate("createdBy", "username email avatar")
      .populate("collaborators.user", "username email avatar");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const collaborator = project.collaborators.find((c) => {
      const collaboratorUserId = c.user?._id
        ? c.user._id.toString()
        : c.user.toString();
      return collaboratorUserId === userId.toString();
    });

    if (!collaborator) {
      return res.status(403).json({
        success: false,
        message: "You are not a collaborator of this project",
      });
    }

    // Fetch full node list for this project
    const nodes = await FileFolder.find({ project: projectId })
      .sort({ type: 1, name: 1, createdAt: 1 })
      .lean();

    // Build tree
    const nodeMap = new Map();
    for (const node of nodes) {
      nodeMap.set(node._id.toString(), {
        _id: node._id,
        name: node.name,
        type: node.type,
        parent: node.parent,
        language: node.language,
        // keep content out of tree payload for performance
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
      message: "Project opened successfully",
      project: {
        _id: project._id,
        projectName: project.projectName,
        projectDesc: project.projectDesc,
        inviteCode: project.inviteCode,
        createdBy: project.createdBy,
        collaborators: project.collaborators,
        yourRole: collaborator.role,
      },
      tree,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
