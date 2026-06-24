import "./Landing.css";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaCode,
  FaUsers,
  FaFolderOpen,
  FaGithub,
  FaArrowRight,
} from "react-icons/fa";
import { useState } from "react";

export default function Landing() {
  const { user, setUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate(user ? "/dashboard" : "/login");
  };

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      console.log(err);
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  return (
    <div className="landing-page">
      {/* HEADER */}

      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            CodeSync
          </Link>

          {!user ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>

              <Link to="/register" className="btn-register">
                Register
              </Link>
            </div>
          ) : (
            <div className="user-menu">
              <img
                src={user.avatar}
                alt=""
                className="avatar"
                onClick={() => setShowMenu((prev) => !prev)}
              />

              {showMenu && (
                <div className="dropdown">
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setShowMenu(false);
                    }}
                    className="dropdown-item"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <div className="hero-content">
        <section className="hero">
          <div className="hero-badge">Real-Time Collaborative Coding</div>

          <h1 className="hero-title">
            Build Together.
            <span>Code Faster.</span>
          </h1>

          <p className="hero-description">
            Create projects, invite teammates, manage roles, and build software
            together inside a modern collaborative coding workspace.
          </p>

          <div className="hero-actions">
            <button onClick={handleGetStarted} className="btn-primary">
              Get Started
              <FaArrowRight />
            </button>

            <a href="#features" className="btn-secondary">
              Learn More
            </a>
          </div>
        </section>
      </div>
      {/* IDE PREVIEW */}

      <section className="ide-preview">
        <div className="ide-window">
          <div className="window-header">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
          </div>

          <div className="ide-body">
            <div className="explorer">
              <h4>EXPLORER</h4>

              <ul>
                <li>📁 src</li>
                <li>📁 pages</li>
                <li>📄 Dashboard.jsx</li>
                <li>📄 Project.jsx</li>
                <li>📁 components</li>
                <li>📄 Editor.jsx</li>
                <li>📄 Sidebar.jsx</li>
              </ul>
            </div>

            <div className="editor">
              <div className="tabs">
                <span className = "active-tab">App.jsx</span>
                <span>Dashboard.jsx</span>
              </div>

              <pre className="code-block">
                <span className="kw">function</span>{" "}
                <span className="fn">App</span>()
                {" {"}
                {"\n"}
                {"  "}
                <span className="kw">return</span> ({"\n"}
                {"    "}
                <span className="tag">&lt;CodeSync&gt;</span>
                {"\n"}
                {"      "}
                <span className="tag">&lt;CollaborativeEditor /&gt;</span>
                {"\n"}
                {"    "}
                <span className="tag">&lt;/CodeSync&gt;</span>
                {"\n"}
                {"  "}
                );
                {"\n"}
                {"}"}
                {"\n\n"}
                <span className="kw">export default</span>{" "}
                <span className="fn">App</span>;
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="features-header">
          <span className="features-badge">FEATURES</span>

          <h2>Everything Needed To Collaborate</h2>

          <p>
            Everything your team needs to build software together in one
            workspace.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <FaFolderOpen />

            <h3>Project Management</h3>

            <p>
              Create projects, organize folders and files, and keep everything
              structured.
            </p>
          </div>

          <div className="feature-card">
            <FaUsers />

            <h3>Team Collaboration</h3>

            <p>
              Invite teammates and manage viewer, editor and owner permissions.
            </p>
          </div>

          <div className="feature-card">
            <FaCode />

            <h3>Real-Time Coding</h3>

            <p>
              Edit files together with live synchronization and collaborative
              workflows.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="cta">
        <h2>Ready To Build Together?</h2>

        <p>
          Launch your collaborative workspace and start coding with your team.
        </p>

        <button onClick={handleGetStarted} className="btn-primary">
          Launch Workspace
        </button>
      </section>

      {/* FOOTER */}

      <footer className="footer">
        <div className="footer-content">
          <div>
            <h3>CodeSync</h3>

            <p>Collaborative coding workspace.</p>
          </div>

          <a href="https://github.com/MukulSharma1203/CodeSync">
            <FaGithub />
          </a>
        </div>
      </footer>
    </div>
  );
}
