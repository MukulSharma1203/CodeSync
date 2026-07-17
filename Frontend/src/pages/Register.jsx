import "./Register.css";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";
import { FiZap, FiUsers, FiShare2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    if (!avatar) {
      showMessage("Avatar is required", "error");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("avatar", avatar);

      const response = await api.post("/users/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data.user);

      showMessage("Account created successfully", "success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Registration failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FiZap />,
      title: "Real-Time Collaboration",
      desc: "Code together instantly.",
    },
    {
      icon: <FiUsers />,
      title: "Role Management",
      desc: "Owner, editor and viewer roles.",
    },
    {
      icon: <FiShare2 />,
      title: "Project Sharing",
      desc: "Invite teammates easily.",
    },
  ];

  return (
    <div className="register-page">
      <AnimatePresence>
        {message && (
          <motion.div
            className={`toast ${messageType}`}
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        className="auth-header"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="logo">
          CodeSync
        </Link>

        <Link to="/login" className="header-link">
          Login
        </Link>
      </motion.header>

      <main className="register-container">
        <motion.div
          className="register-card"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="register-top">
            <h1>Create Account</h1>
            <p>Join your collaborative workspace</p>
          </div>
          <div className="form-group">
            <label>Avatar</label>

            <label className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
                required
              />

              <div className="avatar-circle">
                {avatar ? (
                  <img
                    src={URL.createObjectURL(avatar)}
                    alt="avatar preview"
                    className="avatar-preview"
                  />
                ) : (
                  <FiPlus />
                )}
              </div>

              <span className="avatar-text">
                {avatar ? avatar.name : "Click to upload"}
              </span>

              <span className="avatar-subtext">JPG, PNG up to 5MB</span>
            </label>
          </div>
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                name="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </motion.div>

        <motion.div
          className="register-features"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              className="mini-feature"
              variants={{
                hidden: { opacity: 0, x: 30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <div className="feature-icon">{f.icon}</div>

              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

export default Register;
