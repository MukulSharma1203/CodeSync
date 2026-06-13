import { Project } from "../models/project.model.js";

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

export const createProject = async (req,res)=>{
    try {
        const {projectName , projectDesc} = req.body;
        
        if (!projectName) {
            return res.status(400).json({
                success: false,
                message: "Project name is required"
            });
        }

        const userId = req.user._id;

        let inviteCode;
        let existingProject;

        do {
            inviteCode = generateCode();

            existingProject = await Project.findOne({
                inviteCode
            });

        } while (existingProject);

        const project = await Project.create({
            projectName,
            projectDesc,
            inviteCode,
            createdBy : userId,
            collaborators :[{
                user : userId,
                role : "owner"
            }]
        })

        return res.status(201).json({
            success:true,
            message:"Project Created Successfully",
            project
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deleteProject = async (req,res)=>{
    try {
        const { projectId } = req.params;
        const userId = req.user._id;    

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        //finding
        const isOwner = project.collaborators.some(
            collaborator =>
                collaborator.user.toString() === userId.toString() &&
                collaborator.role === "owner"
        );

        if (!isOwner) {
            return res.status(403).json({
                success: false,
                message: "Only owner can delete project"
            });
        }

        //deleting
        await Project.findByIdAndDelete(projectId);

        return res.status(200).json({
            success:true,
            message : "Project deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateProject = async (req,res)=>{
    try {
        let { projectName , projectDesc} = req.body;
        const { projectId } = req.params;
        const userId = req.user._id;    

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
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
            collaborator =>
                collaborator.user.toString() === userId.toString() &&
                collaborator.role === "owner"
        );

        if (!isOwner) {
            return res.status(403).json({
                success: false,
                message: "Only owner can Update project"
            });
        }
        
        await Project.findByIdAndUpdate(projectId , {
            projectName,
            projectDesc
        })

        return res.status(200).json({
            success:true,
            message : "Update successful"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// join , leave , getprojects

export const getUserProjects = async (req,res)=>{
    try {
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const joinProject = async (req,res)=>{
    try {
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const leaveProject = async (req,res)=>{
    try {
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}