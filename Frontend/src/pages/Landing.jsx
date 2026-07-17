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
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

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
      toast.error(err.response?.data?.message || "Logout failed");
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  const features = [
    {
      icon: <FaFolderOpen />,
      title: "Project Management",
      desc: "Create projects, organize folders and files, and keep everything structured.",
      accent: "violet",
    },
    {
      icon: <FaUsers />,
      title: "Team Collaboration",
      desc: "Invite teammates and manage viewer, editor and owner permissions.",
      accent: "cyan",
    },
    {
      icon: <FaCode />,
      title: "Real-Time Coding",
      desc: "Edit files together with live synchronization and collaborative workflows.",
      accent: "fuchsia",
    },
  ];

  return (
    <div className="landing-page">
      {/* HEADER */}
      <motion.header
        className="header"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
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

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    className="dropdown"
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.header>

      {/* HERO */}
      <div className="hero-content">
        <motion.section
          className="hero"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-badge" variants={fadeUp}>
            <span className="badge-dot" />
            Real-Time Collaborative Coding
          </motion.div>

          <motion.h1 className="hero-title" variants={fadeUp}>
            Build Together.
            <span className="grad-text">Code Faster.</span>
          </motion.h1>

          <motion.p className="hero-description" variants={fadeUp}>
            Create projects, invite teammates, manage roles, and build software
            together inside a modern collaborative coding workspace.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp}>
            <button onClick={handleGetStarted} className="btn-primary">
              Get Started
              <FaArrowRight />
            </button>

            <a href="#features" className="btn-secondary">
              Learn More
            </a>
          </motion.div>

          <motion.div className="hero-stats" variants={fadeUp}>
            <div className="stat">
              <strong>Live</strong>
              <span>Sync engine</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>4+</strong>
              <span>Languages</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>Roles</strong>
              <span>Fine-grained access</span>
            </div>
          </motion.div>
        </motion.section>
      </div>

      {/* IDE PREVIEW */}
      <motion.section
        className="ide-preview"
        initial={{ opacity: 0, y: 60, rotateX: 12 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ide-glow" />
        <div className="ide-window">
          <div className="window-header">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
            <span className="window-title">App.jsx — CodeSync</span>
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
                <span className="active-tab">App.jsx</span>
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
                <span className="fn">App</span>;<span className="caret">|</span>
              </pre>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section id="features" className="features">
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="features-badge">FEATURES</span>

          <h2>Everything Needed To Collaborate</h2>

          <p>
            Everything your team needs to build software together in one
            workspace.
          </p>
        </motion.div>

        <motion.div
          className="feature-grid"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={`feature-card accent-${f.accent}`}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -8 }}
            >
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section
        className="cta"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
      >
        <div className="cta-inner">
          <h2>Ready To Build Together?</h2>

          <p>
            Launch your collaborative workspace and start coding with your team.
          </p>

          <button onClick={handleGetStarted} className="btn-primary">
            Launch Workspace
            <FaArrowRight />
          </button>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <h3>CodeSync</h3>

            <p>Collaborative coding workspace.</p>
          </div>

          <a
            href="https://github.com/MukulSharma1203/CodeSync"
            className="footer-github"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
        </div>
      </footer>
    </div>
  );
}
