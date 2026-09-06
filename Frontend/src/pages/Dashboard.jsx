import "./Dashboard.css";
import api from "../api/axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaPen,
  FaSignInAlt,
  FaUsers,
  FaTimes,
  FaPlus,
  FaRegCopy,
  FaFolderOpen,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const { user, setUser } = useAuth();

  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);

  const [inviteCode, setInviteCode] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);

  const [projectName, setProjectName] = useState("");

  const [projectDesc, setProjectDesc] = useState("");

  const [showMembersModal, setShowMembersModal] = useState(false);

  const [membersProject, setMembersProject] = useState(null);

  const [confirmModal, setConfirmModal] = useState(false);

  const [confirmTitle, setConfirmTitle] = useState("");

  const [confirmMessage, setConfirmMessage] = useState("");

  const [confirmAction, setConfirmAction] = useState(null);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/dashboard/get-user-project");

      setProjects(response.data.projects);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Logout failed");
      }
    } finally {
      sessionStorage.setItem("codesync-logged-out", "true");
      setShowProfileMenu(false);
      setUser(null);
      window.location.href = "/";
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      await api.post("/dashboard/create-project", {
        projectName,
        projectDesc,
      });

      setShowCreateModal(false);

      setProjectName("");

      setProjectDesc("");

      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || "Couldn't create project");
    }
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();

    try {
      await api.post("/dashboard/join-project", {
        inviteCode,
      });

      setInviteCode("");

      setShowJoinModal(false);

      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || "Couldn't join project");
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);

    setProjectName(project.projectName);

    setProjectDesc(project.projectDesc || "");

    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/dashboard/update-project/${selectedProject._id}`, {
        projectName,
        projectDesc,
      });

      setShowEditModal(false);

      setSelectedProject(null);

      setProjectName("");

      setProjectDesc("");

      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || "Couldn't update project");
    }
  };

  const handleDeleteProject = (projectId) => {
    setConfirmTitle("Delete Project");

    setConfirmMessage(
      "This project will be permanently deleted. This action cannot be undone.",
    );

    setConfirmAction(() => async () => {
      try {
        await api.delete(`/dashboard/delete-project/${projectId}`);

        fetchProjects();
      } catch (error) {
        alert(error.response?.data?.message || "Couldn't delete project");
      } finally {
        setConfirmModal(false);
      }
    });

    setConfirmModal(true);
  };

  const handleLeaveProject = (projectId) => {
    setConfirmTitle("Leave Project");

    setConfirmMessage(
      "You will lose access to this project. You can only rejoin using an invite code.",
    );

    setConfirmAction(() => async () => {
      try {
        await api.delete(`/dashboard/leave-project/${projectId}`);

        fetchProjects();
      } catch (error) {
        alert(error.response?.data?.message || "Couldn't leave project");
      } finally {
        setConfirmModal(false);
      }
    });

    setConfirmModal(true);
  };

  const handleRoleChange = (projectId, collaboratorId, role) => {
    setConfirmTitle("Update Role");

    setConfirmMessage(`Change this collaborator's role to ${role}?`);

    setConfirmAction(() => async () => {
      try {
        await api.patch(
          `/dashboard/update-collaborator-role/${projectId}/${collaboratorId}`,
          { role },
        );

        fetchProjects();

        setMembersProject((prev) => ({
          ...prev,
          collaborators: prev.collaborators.map((c) =>
            c.user._id === collaboratorId ? { ...c, role } : c,
          ),
        }));
      } catch (error) {
        alert(error.response?.data?.message || "Couldn't update role");
      } finally {
        setConfirmModal(false);
      }
    });

    setConfirmModal(true);
  };

  const handleDeleteCollaborator = (projectId, collaboratorId) => {
    setConfirmTitle("Remove Collaborator");

    setConfirmMessage(
      "This collaborator will immediately lose access to the project.",
    );

    setConfirmAction(() => async () => {
      try {
        await api.delete(
          `/dashboard/delete-collaborator/${projectId}/${collaboratorId}`,
        );

        fetchProjects();

        setMembersProject((prev) => ({
          ...prev,
          collaborators: prev.collaborators.filter(
            (c) => c.user._id !== collaboratorId,
          ),
        }));
      } catch (error) {
        alert(error.response?.data?.message || "Couldn't remove collaborator");
      } finally {
        setConfirmModal(false);
      }
    });

    setConfirmModal(true);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <div className="dashboard-page">
      <motion.header
        className="dashboard-header"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="logo">
          CodeSync
        </h1>

        <div className="header-right">
          <div className="user-menu">
            <img
              src={user?.avatar}
              alt=""
              className="avatar"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            />

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  className="profile-menu"
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      <main className="dashboard-content">
        <motion.div
          className="dashboard-top"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="dashboard-heading">
            <h2>Projects</h2>
            <p>Manage and open your collaborative workspaces</p>
          </div>

          <div className="dashboard-actions">
            <button className="join-btn" onClick={() => setShowJoinModal(true)}>
              <FaSignInAlt />
              Join Project
            </button>

            <button
              className="create-btn"
              onClick={() => {
                setProjectName("");
                setProjectDesc("");
                setShowCreateModal(true);
              }}
            >
              <FaPlus />
              Create Project
            </button>
          </div>
        </motion.div>

        <hr className="divider" />

        {loading ? (
          <div className="dashboard-loading">
            <span className="cs-spinner" />
            <p>Loading your projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-icon">
              <FaFolderOpen />
            </div>
            <h2>No Projects Yet</h2>

            <p>Create your first project to begin collaborating.</p>

            <button
              className="create-btn"
              onClick={() => {
                setProjectName("");
                setProjectDesc("");
                setShowCreateModal(true);
              }}
            >
              <FaPlus />
              Create Project
            </button>
          </motion.div>
        ) : (
          <div className="projects-grid">
            {projects.map((project, index) => {
              const myCollaborator = project.collaborators.find(
                (c) => c.user._id?.toString() === user._id.toString(),
              );

              const isOwner = myCollaborator?.role === "owner";

              return (
                <motion.div
                  key={project._id}
                  className="project-card"
                  variants={cardVariants}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -6 }}
                >
                  <div className="project-header">
                    <div className="project-title">
                      <div className="project-avatar">
                        {project.projectName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{project.projectName}</h3>
                        <span className={`role-pill role-${myCollaborator?.role}`}>
                          {myCollaborator?.role}
                        </span>
                      </div>
                    </div>
                    <div className="project-actions">
                      {isOwner ? (
                        <>
                          <button
                            className="icon-btn edit-btn"
                            onClick={() => openEditModal(project)}
                            title="Edit Project"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="icon-btn danger-btn"
                            onClick={() => handleDeleteProject(project._id)}
                            title="Delete Project"
                          >
                            <FaTrash />
                          </button>
                        </>
                      ) : (
                        <button
                          className="icon-btn danger-btn"
                          onClick={() => handleLeaveProject(project._id)}
                          title="Leave Project"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="project-desc">
                    {project.projectDesc || "No description provided"}
                  </p>

                  <div className="project-footer">
                    <div className="footer-left">
                      <button
                        className="members-btn"
                        onClick={() => {
                          setMembersProject(project);
                          setShowMembersModal(true);
                        }}
                        title="Collaborators"
                      >
                        <FaUsers />
                        <span>{project.collaborators.length}</span>
                      </button>

                      {isOwner && (
                        <div
                          className="invite-code"
                          onClick={() => {
                            navigator.clipboard.writeText(project.inviteCode);
                            toast.success("Invite code copied!");
                          }}
                          title="Click to copy invite code"
                        >
                          <FaRegCopy />
                          {project.inviteCode}
                        </div>
                      )}
                    </div>

                    <button
                      className="open-btn"
                      onClick={() => navigate(`/project/${project._id}`)}
                    >
                      Open
                      <FaSignInAlt />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {showCreateModal && (
            <ModalShell onClose={() => setShowCreateModal(false)}>
              <h2>Create Project</h2>
              <p className="modal-sub">Start a new collaborative workspace</p>

              <form onSubmit={handleCreateProject}>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />

                <textarea
                  rows="5"
                  placeholder="Project Description"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                />

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm">
                    Create
                  </button>
                </div>
              </form>
            </ModalShell>
          )}

          {showJoinModal && (
            <ModalShell onClose={() => setShowJoinModal(false)}>
              <h2>Join Project</h2>
              <p className="modal-sub">Enter an invite code to collaborate</p>

              <form onSubmit={handleJoinProject}>
                <input
                  type="text"
                  placeholder="Invite Code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm">
                    Join
                  </button>
                </div>
              </form>
            </ModalShell>
          )}

          {showEditModal && (
            <ModalShell
              onClose={() => {
                setShowEditModal(false);
                setSelectedProject(null);
              }}
            >
              <h2>Edit Project</h2>
              <p className="modal-sub">Update your project details</p>

              <form onSubmit={handleUpdateProject}>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />

                <textarea
                  rows="5"
                  placeholder="Project Description"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                />

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedProject(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm">
                    Save Changes
                  </button>
                </div>
              </form>
            </ModalShell>
          )}

          {showMembersModal && membersProject && (
            <ModalShell
              className="members-modal"
              onClose={() => {
                setShowMembersModal(false);
                setMembersProject(null);
              }}
            >
              <h2>Collaborators</h2>
              <p className="modal-sub">Manage who can access this project</p>

              <div className="members-list">
                {membersProject.collaborators.map((member) => (
                  <div className="member-row" key={member.user._id}>
                    <div className="member-info">
                      <img
                        src={member.user.avatar}
                        alt=""
                        className="member-avatar"
                      />

                      <div className="member-text">
                        <strong>{member.user.username}</strong>

                        <p>{member.role}</p>
                      </div>
                    </div>

                    {member.role !== "owner" && (
                      <div className="member-actions">
                        <div className="role-buttons">
                          <button
                            className={
                              member.role === "viewer" ? "role-active" : ""
                            }
                            onClick={() =>
                              handleRoleChange(
                                membersProject._id,
                                member.user._id,
                                "viewer",
                              )
                            }
                          >
                            Viewer
                          </button>

                          <button
                            className={
                              member.role === "editor" ? "role-active" : ""
                            }
                            onClick={() =>
                              handleRoleChange(
                                membersProject._id,
                                member.user._id,
                                "editor",
                              )
                            }
                          >
                            Editor
                          </button>
                        </div>

                        <button
                          className="icon-btn danger-btn"
                          onClick={() =>
                            handleDeleteCollaborator(
                              membersProject._id,
                              member.user._id,
                            )
                          }
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowMembersModal(false);
                    setMembersProject(null);
                  }}
                >
                  Close
                </button>
              </div>
            </ModalShell>
          )}

          {confirmModal && (
            <ModalShell
              className="confirm-modal"
              onClose={() => setConfirmModal(false)}
            >
              <h2>{confirmTitle}</h2>

              <p className="modal-sub">{confirmMessage}</p>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setConfirmModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="danger-btn-large"
                  onClick={confirmAction}
                >
                  Confirm
                </button>
              </div>
            </ModalShell>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Reusable animated modal wrapper
function ModalShell({ children, onClose, className = "" }) {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className={`modal ${className}`}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
