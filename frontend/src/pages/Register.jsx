import "./Register.css";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

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

  return (
    <div className="register-page">
      {message && <div className={`toast ${messageType}`}>{message}</div>}
      <header className="auth-header">
        <Link to="/" className="logo">
          CodeSync
        </Link>

        <Link to="/login" className="header-link">
          Login
        </Link>
      </header>

      <main className="register-container">
        <div className="register-card">
          <div className="register-top">
            <h1>Create Account</h1>
            <p>Join your collaborative workspace</p>
          </div>
          <div className="form-group">
            <label>Avatar</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              required
            />
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
        </div>

        <div className="register-features">
          <div className="mini-feature">
            <h3>Real-Time Collaboration</h3>
            <p>Code together instantly.</p>
          </div>

          <div className="mini-feature">
            <h3>Role Management</h3>
            <p>Owner, editor and viewer roles.</p>
          </div>

          <div className="mini-feature">
            <h3>Project Sharing</h3>
            <p>Invite teammates easily.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;
