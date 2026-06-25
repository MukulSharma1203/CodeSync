import "./Dashboard.css";
import api from "../api/axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPen, FaSignInAlt, FaUsers, FaTimes } from "react-icons/fa";

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
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.log(error);
    } finally {
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

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="logo">CodeSync</h1>

        <div className="header-right">
          <div className="user-menu">
            <img
              src={user?.avatar}
              alt=""
              className="avatar"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            />

            {showProfileMenu && (
              <div className="profile-menu">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-top">
          <h2>Projects</h2>

          <div className="dashboard-actions">
            <button className="join-btn" onClick={() => setShowJoinModal(true)}>
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
              Create Project
            </button>
          </div>
        </div>

        <hr className="divider" />

        {loading ? (
          <h2>Loading...</h2>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h2>No Projects Yet</h2>

            <p>Create your first project to begin collaborating.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => {
              const myCollaborator = project.collaborators.find(
                (c) => c.user._id?.toString() === user._id.toString(),
              );

              const isOwner = myCollaborator?.role === "owner";

              return (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <div>
                      <h3>{project.projectName}</h3>

                      <p>{project.projectDesc || "No description provided"}</p>
                    </div>
                    <div className="project-actions">
                      {isOwner ? (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => openEditModal(project)}
                            title="Edit Project"
                          >
                            <FaPen />
                          </button>

                          <button
                            className="danger-btn"
                            onClick={() => handleDeleteProject(project._id)}
                            title="Delete Project"
                          >
                            <FaTrash />
                          </button>
                        </>
                      ) : (
                        <button
                          className="danger-btn"
                          onClick={() => handleLeaveProject(project._id)}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="project-members">
                    <button
                      className="members-btn"
                      onClick={() => {
                        setMembersProject(project);
                        setShowMembersModal(true);
                      }}
                    >
                      <FaUsers />
                    </button>
                  </div>

                  <div className="project-footer">
                    <span className="project-role">{myCollaborator?.role}</span>

                    <div className="footer-buttons">
                      <button
                        className="open-btn"
                        onClick={() => navigate(`/project/${project._id}`)}
                      >
                        <FaSignInAlt />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Create Project</h2>

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
                  <button type="submit">Create</button>

                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Join Project</h2>

              <form onSubmit={handleJoinProject}>
                <input
                  type="text"
                  placeholder="Invite Code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />

                <div className="modal-buttons">
                  <button type="submit">Join</button>

                  <button type="button" onClick={() => setShowJoinModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Project</h2>

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
                  <button type="submit">Save Changes</button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedProject(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMembersModal && membersProject && (
          <div className="modal-overlay">
            <div className="modal members-modal">
              <h2>Collaborators</h2>

              {membersProject.collaborators.map((member) => (
                <div className="member-row" key={member.user._id}>
                  <div className="member-info">
                    <img
                      src={member.user.avatar}
                      alt=""
                      className="member-avatar"
                    />

                    <div>
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
                        className="danger-btn"
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

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setShowMembersModal(false);
                    setMembersProject(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {confirmModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>{confirmTitle}</h2>

              <p>{confirmMessage}</p>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
