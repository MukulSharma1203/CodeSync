import "./Landing.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { FaArrowRight, FaChevronDown } from "react-icons/fa";

export default function Landing() {
  const { user, setUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(user ? "/dashboard" : "/register");
  };

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || "Logout failed");
      }
    } finally {
      sessionStorage.setItem("codesync-logged-out", "true");
      setUser(null);
      window.location.replace("/");
    }
  };

  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-logo" aria-label="CodeSync home">
          Code<span>Sync</span>
        </Link>

        <nav className="landing-nav" aria-label="Main navigation">
          {!user ? (
            <>
              <Link to="/login" className="landing-login">
                Login
              </Link>
              <Link to="/register" className="landing-header-cta">
                Get Started
              </Link>
            </>
          ) : (
            <div className="landing-user-menu">
              <button
                type="button"
                className="landing-avatar-button"
                onClick={() => setShowMenu((visible) => !visible)}
                aria-expanded={showMenu}
                aria-label="Open account menu"
              >
                <img src={user.avatar} alt="" className="landing-avatar" />
                <FaChevronDown aria-hidden="true" />
              </button>
              {showMenu && (
                <div className="landing-dropdown">
                  <button type="button" onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </button>
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <h1 id="landing-title">
            Build Together.
            <span>Code Better.</span>
          </h1>
          <p>A modern collaborative coding workspace for you and your team.</p>
          <button type="button" className="landing-cta" onClick={handleGetStarted}>
            Get Started
            <FaArrowRight aria-hidden="true" />
          </button>
        </div>

        <div className="landing-art" aria-hidden="true">
          <img className="landing-cat-bg" src="/landing/catBg.svg" alt="" />
          <img className="landing-cat-point" src="/landing/catPoint.svg" alt="" />
        </div>
      </section>
    </main>
  );
}
