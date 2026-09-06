import "./Register.css";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(response.data.user);
      showMessage("Account created successfully", "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      showMessage(error.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <AnimatePresence>
        {message && (
          <motion.div
            className={`register-toast ${messageType}`}
            initial={{ opacity: 0, y: -24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -24, x: "-50%" }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="register-header">
        <Link to="/" className="register-logo">
          Code<span>Sync</span>
        </Link>
        <Link to="/login" className="register-login-link">
          Login
        </Link>
      </header>

      <section className="register-stage" aria-labelledby="register-title">
        <img className="register-nerd-cat" src="/register/catNerd.svg" alt="" />

        <div className="register-card">
          <div className="register-heading">
            <h1 id="register-title">
              Create <span>Account</span>
            </h1>
            <p>Join your collaborative coding workspace</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <label className="register-avatar-field">
              <span>Avatar</span>
              <span className="register-avatar-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setAvatar(event.target.files[0])}
                  required
                />
                <span className="register-avatar-circle">
                  {avatar ? (
                    <img src={URL.createObjectURL(avatar)} alt="Avatar preview" />
                  ) : (
                    <FiPlus aria-hidden="true" />
                  )}
                </span>
                <strong>{avatar ? avatar.name : "Click to upload"}</strong>
                <small>JPG, PNG up to 5MB</small>
              </span>
            </label>

            <label className="register-field">
              <span>Username</span>
              <span className="register-input-wrap">
                <FaUser aria-hidden="true" />
                <input
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </span>
            </label>

            <label className="register-field">
              <span>Email</span>
              <span className="register-input-wrap">
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

            <div className="register-password-grid">
              <label className="register-field">
                <span>Password</span>
                <span className="register-input-wrap">
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
                    className="register-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </span>
              </label>

              <label className="register-field">
                <span>Confirm Password</span>
                <span className="register-input-wrap">
                  <FaLock aria-hidden="true" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </span>
              </label>
            </div>

            <button type="submit" className="register-submit" disabled={loading}>
              {loading ? <span className="register-spinner" /> : "Create Account"}
            </button>
          </form>

          <p className="register-account-prompt">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <img className="register-walking-cat" src="/register/catWalking.svg" alt="" />
      </section>
    </main>
  );
}

export default Register;
