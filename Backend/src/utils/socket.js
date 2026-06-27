import { Server } from "socket.io";
import { Project } from "../models/project.model.js";

let io;
const liveFiles = new Map();
const onlineUsers = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    

    socket.on("join-project", async ({ projectId, userId }) => {
      await socket.join(projectId);

      socket.projectId = projectId;
      socket.userId = userId;

      if (!onlineUsers.has(projectId)) {
        onlineUsers.set(projectId, new Set());
      }

      onlineUsers.get(projectId).add(userId);

      const project = await Project.findById(projectId).populate(
        "collaborators.user",
        "username avatar",
      );

      const users = project.collaborators
        .filter((c) => onlineUsers.get(projectId).has(c.user._id.toString()))
        .map((c) => ({
          _id: c.user._id,
          username: c.user.username,
          avatar: c.user.avatar,
        }));

      io.to(projectId).emit("online-users", users);
    });

    socket.on("code-change", (data) => {
      liveFiles.set(data.fileId, data.content);

      socket.to(data.projectId).emit("code-change", {
        fileId: data.fileId,
        content: data.content,
      });
    });

    socket.on("disconnect", async () => {
      if (socket.projectId && socket.userId) {
        const users = onlineUsers.get(socket.projectId);

        if (users) {
          users.delete(socket.userId);

          if (users.size === 0) {
            onlineUsers.delete(socket.projectId);
          }

          const project = await Project.findById(socket.projectId).populate(
            "collaborators.user",
            "username avatar",
          );

          const online = project.collaborators
            .filter((c) =>
              onlineUsers.get(socket.projectId)?.has(c.user._id.toString()),
            )
            .map((c) => ({
              _id: c.user._id,
              username: c.user.username,
              avatar: c.user.avatar,
            }));

          io.to(socket.projectId).emit("online-users", online);
        }

        socket.leave(socket.projectId);
      }
    });

    socket.on("leave-project", async () => {
      if (!socket.projectId || !socket.userId) return;

      const users = onlineUsers.get(socket.projectId);

      if (users) {
        users.delete(socket.userId);

        if (users.size === 0) {
          onlineUsers.delete(socket.projectId);
        }

        const project = await Project.findById(socket.projectId).populate(
          "collaborators.user",
          "username avatar",
        );

        const online = project.collaborators
          .filter((c) =>
            onlineUsers.get(socket.projectId)?.has(c.user._id.toString()),
          )
          .map((c) => ({
            _id: c.user._id,
            username: c.user.username,
            avatar: c.user.avatar,
          }));

        io.to(socket.projectId).emit("online-users", online);
      }

      socket.leave(socket.projectId);

      socket.projectId = null;
      socket.userId = null;
    });
  });
};

export const getIO = () => io;

export const getLiveFiles = () => liveFiles;
