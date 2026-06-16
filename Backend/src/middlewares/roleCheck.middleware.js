import { Project } from "../models/project.model.js";

export const permittedUserRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const userId = req.user._id;

            if (!projectId) {
                return res.status(400).json({
                    success: false,
                    message: "ProjectId is required"
                });
            }

            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }

            const collaborator = project.collaborators.find(
                item => item.user.toString() === userId.toString()
            );

            if (!collaborator) {
                return res.status(403).json({
                    success: false,
                    message: "You are not a collaborator of this project"
                });
            }

            if (!allowedRoles.includes(collaborator.role)) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this route"
                });
            }

            req.project = project;
            req.projectRole = collaborator.role;
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
};