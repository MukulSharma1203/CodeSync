import "./NotFound.css";
import { Link } from "react-router-dom";
import { FaHome, FaCode } from "react-icons/fa";

function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <div className="error-code">404</div>

        <FaCode className="error-icon" />

        <h1>Page Not Found</h1>

        <p>The page you're looking for doesn't exist or may have been moved.</p>

        <Link to="/" className="home-btn">
          <FaHome />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
