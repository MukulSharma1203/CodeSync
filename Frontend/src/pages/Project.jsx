import "./Project.css";
import Editor from "@monaco-editor/react";
import api from "../api/axios";
import socket from "../socket";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaFolder,
  FaFolderPlus,
  FaFileCirclePlus,
  FaPen,
  FaTrash,
  FaArrowLeft,
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

  const fetchTree = async () => {
    try {
      const res = await api.get(`/project/get-folder-tree/${projectId}`);

      setTree(res.data.tree);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
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
    const refreshTree = (data) => {
      console.log("Socket event received:", data);
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
  }, [projectId]);

  useEffect(() => {
    const handleIncomingCode = (data) => {
      console.log("Incoming code:", data);

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
    } catch (error) {
      alert(error.response?.data?.message);
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
    } catch (error) {
      alert(error.response?.data?.message);
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
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await api.delete(`/project/delete-file-folder/${projectId}/${itemId}`);

      fetchTree();
    } catch (error) {
      alert(error.response?.data?.message);
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
      alert(error.response?.data?.message);
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

      alert("Saved");
    } catch (error) {
      alert(error.response?.data?.message);
    }
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
            {node.type === "folder" ? (
              <FaFolder className="folder-icon" />
            ) : node.language === "python" ? (
              <SiPython className="file-icon python-icon" />
            ) : node.language === "cpp" ? (
              <SiCplusplus className="file-icon cpp-icon" />
            ) : node.language === "java" ? (
              <SiOpenjdk className="file-icon java-icon" />
            ) : node.language === "javascript" ? (
              <SiJavascript className="file-icon js-icon" />
            ) : (
              <FaFileCirclePlus className="file-icon" />
            )}

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
        <button className="toolbar-btn dashboard-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft />
          Dashboard
        </button>

        <h1>CodeSync</h1>

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
            Explorer
          </div>

          {loading ? <p>Loading...</p> : renderTree(tree)}
        </aside>

        <main className="editor-panel">
          <>
            {selectedFile ? (
              <div className="editor-area">
                <div className="editor-topbar">
                  <span>{selectedFile.name}</span>

                  <button onClick={handleSaveFile}>Save</button>
                </div>

                <div className="monaco-container">
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
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="editor-placeholder">
                <h2>Select a file</h2>

                <p>Your Monaco editor will be placed here later.</p>
              </div>
            )}
          </>
        </main>
      </div>
      {showFolderModal && (
        <div className="project-modal-overlay">
          <div className="project-modal">
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
                <button type="submit">Create</button>

                <button type="button" onClick={() => setShowFolderModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFileModal && (
        <div className="modal-overlay">
          <div className="modal">
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

              <div className="modal-buttons">
                <button type="submit">Create</button>

                <button type="button" onClick={() => setShowFileModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showRenameModal && (
        <div className="modal-overlay">
          <div className="modal">
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

              <div className="modal-buttons">
                <button type="submit">Save</button>

                <button type="button" onClick={() => setShowRenameModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Project;
