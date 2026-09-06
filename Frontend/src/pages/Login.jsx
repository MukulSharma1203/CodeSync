import "./Login.css";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      const response = await api.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      setUser(response.data.user);
      showMessage("Login successful", "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      showMessage(error.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <AnimatePresence>
        {message && (
          <motion.div
            className={`login-toast ${messageType}`}
            initial={{ opacity: 0, y: -24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -24, x: "-50%" }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="login-header">
        <Link to="/" className="login-logo">
          Code<span>Sync</span>
        </Link>
        <Link to="/register" className="login-register-link">
          Register
        </Link>
      </header>

      <section className="login-stage" aria-labelledby="login-title">
        <img className="login-falling-cat" src="/login/fallingCat.svg" alt="" />

        <div className="login-card">
          <div className="login-heading">
            <h1 id="login-title">
              Welcome <span>Back</span>
            </h1>
            <p>Continue your coding journey</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>Email</span>
              <span className="login-input-wrap">
                <FaEnvelope aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </span>
            </label>

            <label className="login-field">
              <span>Password</span>
              <span className="login-input-wrap">
                <FaLock aria-hidden="true" />
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
                  className="login-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </span>
            </label>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? <span className="login-spinner" /> : "Login"}
            </button>
          </form>

          <p className="login-account-prompt">
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </div>

        <img className="login-swag-cat" src="/login/swagCat.svg" alt="" />
      </section>
    </main>
  );
}

export default Login;
