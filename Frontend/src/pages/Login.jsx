import "./Login.css";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaBolt,
  FaUsers,
  FaShareAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: <FaBolt />,
    title: "Instant Access",
    desc: "Jump back into your projects immediately.",
  },
  {
    icon: <FaUsers />,
    title: "Real-Time Collaboration",
    desc: "Work with teammates without interruptions.",
  },
  {
    icon: <FaShareAlt />,
    title: "Project Sharing",
    desc: "Manage and share projects securely.",
  },
];

function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

    setMessage("");

    try {
      setLoading(true);

      const response = await api.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      setUser(response.data.user);

      showMessage("Login successful", "success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      showMessage(error.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <AnimatePresence>
        {message && (
          <motion.div
            className={`toast ${messageType}`}
            initial={{ opacity: 0, y: -24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -24, x: "-50%" }}
            transition={{ duration: 0.3 }}
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

        <Link to="/register" className="header-link">
          Register
        </Link>
      </motion.header>

      <main className="login-container">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="login-top">
            <h1>Welcome Back</h1>
            <p>Continue your collaborative coding journey</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
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

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="cs-spinner" />
                  Signing In...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <Link to="/register">Register</Link>
          </div>
        </motion.div>

        <motion.div
          className="login-features"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
          }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              className="mini-feature"
              variants={{
                hidden: { opacity: 0, x: 30 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              whileHover={{ x: 6 }}
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

export default Login;
