import "./Login.css";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaBolt, FaUsers, FaShareAlt, FaEye, FaEyeSlash } from "react-icons/fa";

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
      {message && <div className={`toast ${messageType}`}>{message}</div>}

      <header className="auth-header">
        <Link to="/" className="logo">
          CodeSync
        </Link>

        <Link to="/register" className="header-link">
          Register
        </Link>
      </header>

      <main className="login-container">
        <div className="login-card">
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
              {loading ? "Signing In..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <Link to="/register">Register</Link>
          </div>
        </div>

        <div className="login-features">
          <div className="mini-feature">
            <div className="feature-icon">
              <FaBolt />
            </div>

            <div>
              <h3>Instant Access</h3>
              <p>Jump back into your projects immediately.</p>
            </div>
          </div>

          <div className="mini-feature">
            <div className="feature-icon">
              <FaUsers />
            </div>

            <div>
              <h3>Real-Time Collaboration</h3>
              <p>Work with teammates without interruptions.</p>
            </div>
          </div>

          <div className="mini-feature">
            <div className="feature-icon">
              <FaShareAlt />
            </div>

            <div>
              <h3>Project Sharing</h3>
              <p>Manage and share projects securely.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
