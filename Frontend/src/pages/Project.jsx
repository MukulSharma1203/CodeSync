import "./Project.css";
import Editor from "@monaco-editor/react";
import api from "../api/axios";
import socket from "../socket";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaFolder,
  FaFolderPlus,
  FaFileCirclePlus,
  FaPen,
  FaTrash,
  FaArrowLeft,
  FaPlay,
  FaFloppyDisk,
  FaTerminal,
} from "react-icons/fa6";

import { SiPython, SiCplusplus, SiJavascript, SiOpenjdk } from "react-icons/si";

function Project() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [tree, setTree] = useState([]);

  const [selectedFolder, setSelectedFolder] = useState(null);

  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const [showFolderModal, setShowFolderModal] = useState(false);

  const [showFileModal, setShowFileModal] = useState(false);

  const [folderName, setFolderName] = useState("");

  const [fileName, setFileName] = useState("");

  const [language, setLanguage] = useState("cpp");

  const [selectedFile, setSelectedFile] = useState(null);

  const [fileContent, setFileContent] = useState("");

  const [editorLanguage, setEditorLanguage] = useState("");

  const [showRenameModal, setShowRenameModal] = useState(false);

  const [renameName, setRenameName] = useState("");

  const [renameLanguage, setRenameLanguage] = useState("cpp");

  const [selectedItem, setSelectedItem] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [running, setRunning] = useState(false);

  const fetchTree = async () => {
    try {
      const res = await api.get(`/project/get-folder-tree/${projectId}`);

      setTree(res.data.tree);
    } catch {
      toast.error("Couldn't load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    socket.emit("join-project", {
      projectId,
      userId: user._id,
    });

    return () => {
      socket.emit("leave-project");
    };
  }, [projectId, user]);

  useEffect(() => {
    const handleUnload = () => {
      socket.emit("leave-project");
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [projectId]);

  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, []);

  useEffect(() => {
    const refreshTree = () => {
      fetchTree();
    };

    socket.on("folder-created", refreshTree);
    socket.on("file-created", refreshTree);
    socket.on("item-renamed", refreshTree);
    socket.on("item-deleted", refreshTree);

    return () => {
      socket.off("folder-created", refreshTree);
      socket.off("file-created", refreshTree);
      socket.off("item-renamed", refreshTree);
      socket.off("item-deleted", refreshTree);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    const handleIncomingCode = (data) => {
      if (selectedFile && data.fileId === selectedFile._id) {
        setFileContent(data.content);
      }
    };

    socket.on("code-change", handleIncomingCode);

    return () => {
      socket.off("code-change", handleIncomingCode);
    };
  }, [selectedFile]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();

    try {
      const parentId = selectedFolder || "root";

      await api.post(`/project/create-folder/${projectId}/${parentId}`, {
        name: folderName,
      });

      setFolderName("");

      setShowFolderModal(false);

      fetchTree();
      toast.success("Folder created");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();

    try {
      const parentId = selectedFolder || "root";

      await api.post(`/project/create-file/${projectId}/${parentId}`, {
        name: fileName,
        language,
      });

      setFileName("");

      setLanguage("cpp");

      setShowFileModal(false);

      fetchTree();
      toast.success("File created");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();

    try {
      await api.put(
        `/project/rename-file-folder/${projectId}/${selectedItem._id}`,
        {
          newName: renameName,
          language: renameLanguage,
        },
      );

      setShowRenameModal(false);

      fetchTree();
      toast.success("Rename Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await api.delete(`/project/delete-file-folder/${projectId}/${itemId}`);

      fetchTree();
      toast.success("Deleted Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleOpenFile = async (node) => {
    try {
      const res = await api.get(
        `/project/get-file-content/${projectId}/${node._id}`,
      );

      setSelectedFile(res.data.file);

      setFileContent(res.data.file.content || "");

      setEditorLanguage(res.data.file.language || "plaintext");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;

    try {
      await api.post(
        `/project/save-file-content/${projectId}/${selectedFile._id}`,
        {
          content: fileContent,
          language: editorLanguage,
        },
      );

      toast.success("File saved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleRun = async () => {
    if (!selectedFile) return;

    setRunning(true);

    try {
      const res = await api.post(
        `/project/run-file/${projectId}/${selectedFile._id}`,
        {
          input: terminalInput,
        },
      );

      setTerminalOutput(
        res.data.output ||
          res.data.stdout ||
          res.data.stderr ||
          "Program finished.",
      );
    } catch (error) {
      setTerminalOutput(error.response?.data?.message || "Execution failed.");
    }

    setRunning(false);
  };

  const handleEditorChange = (value) => {
    const content = value || "";

    setFileContent(content);

    if (!selectedFile) return;

    socket.emit("code-change", {
      projectId,
      fileId: selectedFile._id,
      content,
    });
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);

      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }

      return next;
    });
  };

  const fileIcon = (node) => {
    if (node.type === "folder") return <FaFolder className="folder-icon" />;
    if (node.language === "python")
      return <SiPython className="file-icon python-icon" />;
    if (node.language === "cpp")
      return <SiCplusplus className="file-icon cpp-icon" />;
    if (node.language === "java")
      return <SiOpenjdk className="file-icon java-icon" />;
    if (node.language === "javascript")
      return <SiJavascript className="file-icon js-icon" />;
    return <FaFileCirclePlus className="file-icon" />;
  };

  const renderTree = (nodes) => {
    return nodes.map((node) => (
      <div key={node._id} className="tree-node">
        <div
          className={`tree-item ${
            (node.type === "folder" && selectedFolder === node._id) ||
            (node.type === "file" && selectedFile?._id === node._id)
              ? "selected-folder"
              : ""
          }`}
          onClick={() => {
            if (node.type === "folder") {
              setSelectedFolder(node._id);
              toggleFolder(node._id);
            } else {
              handleOpenFile(node);
            }
          }}
        >
          <>
            {fileIcon(node)}

            <span className="tree-name">{node.name}</span>

            <div className="tree-actions" onClick={(e) => e.stopPropagation()}>
              <FaPen
                className="tree-action"
                onClick={() => {
                  setSelectedItem(node);

                  setRenameName(node.name);

                  setRenameLanguage(node.language || "cpp");

                  setShowRenameModal(true);
                }}
              />

              <FaTrash
                className="tree-action delete"
                onClick={() => handleDelete(node._id)}
              />
            </div>
          </>
        </div>

        {node.children?.length > 0 && expandedFolders.has(node._id) && (
          <div className="tree-children">{renderTree(node.children)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="project-page">
      <header className="editor-header">
        <div className="header-left">
          <button
            className="toolbar-btn dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft />
            Dashboard
          </button>

          <h1 className="project-logo">
            CodeSync
          </h1>
        </div>

        <div className="header-right">
          <div className="online-users">
            {onlineUsers.map((member) => (
              <img
                key={member._id}
                src={member.avatar}
                alt={member.username}
                title={member.username}
                className="online-avatar"
              />
            ))}
          </div>

          <div className="project-toolbar">
            <button
              className="toolbar-btn"
              onClick={() => {
                setFolderName("");
                setShowFolderModal(true);
              }}
            >
              <FaFolderPlus />
              Folder
            </button>

            <button
              className="toolbar-btn"
              onClick={() => {
                setFileName("");
                setLanguage("cpp");
                setShowFileModal(true);
              }}
            >
              <FaFileCirclePlus />
              File
            </button>
          </div>
        </div>
      </header>

      <div className="project-body">
        <aside className="file-sidebar">
          <div
            className="sidebar-title"
            onClick={() => setSelectedFolder(null)}
          >
            <span>Explorer</span>
            {selectedFolder && <span className="sidebar-hint">root</span>}
          </div>

          <div className="sidebar-tree">
            {loading ? (
              <div className="sidebar-loading">
                <span className="cs-spinner" />
              </div>
            ) : tree.length === 0 ? (
              <p className="sidebar-empty">No files yet</p>
            ) : (
              renderTree(tree)
            )}
          </div>
        </aside>

        <main className="editor-panel">
          <>
            {selectedFile ? (
              <div className="editor-area">
                <div className="editor-topbar">
                  <span className="editor-filename">
                    {fileIcon(selectedFile)}
                    {selectedFile.name}
                  </span>

                  <div className="editor-buttons">
                    <button className="save-btn" onClick={handleSaveFile}>
                      <FaFloppyDisk />
                      Save
                    </button>

                    <button
                      className="run-btn"
                      onClick={handleRun}
                      disabled={running}
                    >
                      {running ? (
                        <>
                          <span className="cs-spinner" />
                          Running
                        </>
                      ) : (
                        <>
                          <FaPlay />
                          Run
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="monaco-container">
                  <div className="monaco-editor-wrapper">
                    <Editor
                      height="100%"
                      width="100%"
                      language={editorLanguage}
                      value={fileContent}
                      onChange={handleEditorChange}
                      theme="vs-dark"
                      options={{
                        fontSize: 15,
                        minimap: { enabled: false },
                        automaticLayout: true,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        padding: { top: 16 },
                        fontFamily: "JetBrains Mono, monospace",
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                      }}
                    />
                  </div>
                  <div className="terminal-panel">
                    <div className="terminal-header">
                      <FaTerminal />
                      Terminal
                    </div>

                    <textarea
                      className="terminal-input"
                      placeholder="Program Input (stdin)"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                    />

                    <pre className="terminal-output">
                      {terminalOutput || "Program output will appear here..."}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="editor-placeholder">
                <div className="placeholder-icon">
                  <FaFileCirclePlus />
                </div>
                <h2>Select a file to start coding</h2>

                <p>Pick a file from the explorer or create a new one.</p>
              </div>
            )}
          </>
        </main>
      </div>

      <AnimatePresence>
        {showFolderModal && (
          <ProjectModal onClose={() => setShowFolderModal(false)}>
            <h2>Create Folder</h2>

            <form onSubmit={handleCreateFolder}>
              <input
                type="text"
                placeholder="Folder Name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
              />

              <div className="project-modal-buttons">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setShowFolderModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  Create
                </button>
              </div>
            </form>
          </ProjectModal>
        )}

        {showFileModal && (
          <ProjectModal onClose={() => setShowFileModal(false)}>
            <h2>Create File</h2>

            <form onSubmit={handleCreateFile}>
              <input
                type="text"
                placeholder="File Name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
              />

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="cpp">C++</option>

                <option value="java">Java</option>

                <option value="python">Python</option>

                <option value="javascript">JavaScript</option>
              </select>

              <div className="project-modal-buttons">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setShowFileModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  Create
                </button>
              </div>
            </form>
          </ProjectModal>
        )}

        {showRenameModal && (
          <ProjectModal onClose={() => setShowRenameModal(false)}>
            <h2>Rename</h2>

            <form onSubmit={handleRename}>
              <input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                required
              />

              {selectedItem?.type === "file" && (
                <select
                  value={renameLanguage}
                  onChange={(e) => setRenameLanguage(e.target.value)}
                >
                  <option value="cpp">C++</option>

                  <option value="java">Java</option>

                  <option value="python">Python</option>

                  <option value="javascript">JavaScript</option>
                </select>
              )}

              <div className="project-modal-buttons">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setShowRenameModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  Save
                </button>
              </div>
            </form>
          </ProjectModal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Animated modal wrapper for the project page
function ProjectModal({ children, onClose }) {
  return (
    <motion.div
      className="project-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="project-modal"
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

export default Project;
