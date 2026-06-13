import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";

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
        
        const user = await User.findById(req.user._id).select("-passwordHash -refreshToken");

        var inviteCode;
        const existingProject;

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
            createdBy : user._id,
            collaborators :[{
                user : user._id,
                role : "owner"
            }]
        })


    } catch (error) {
        
    }
};

export const deleteProject = async (req,res)=>{
    try {
        
    } catch (error) {
        
    }
};

export const updateProject = async (req,res)=>{
    try {
        
    } catch (error) {
        
    }
};

export const generateInviteCode = async (req,res)=>{
    try {
        
    } catch (error) {
        
    }
};