import "./NotFound.css";
import { Link } from "react-router-dom";
import { FaHome, FaCode } from "react-icons/fa";
import { motion } from "framer-motion";

function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-cats" aria-hidden="true">
        <motion.img
          src="/register/catNerd.svg"
          alt=""
          className="notfound-cat notfound-cat-nerd"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.55 }}
        />
        <motion.img
          src="/login/swagCat.svg"
          alt=""
          className="notfound-cat notfound-cat-swag"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.55 }}
        />
      </div>

      <motion.div
        className="notfound-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="error-code grad-text"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          404
        </motion.div>

        <div className="error-icon-wrap">
          <FaCode className="error-icon" />
        </div>

        <h1>Page Not Found</h1>

        <p>The page you're looking for doesn't exist or may have been moved.</p>

        <Link to="/" className="home-btn">
          <FaHome />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFound;
