import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { ThemeContext } from "../context/ThemeContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const showAdminLink = isAuthenticated && user?.role === "admin";

  const primaryLinks = [
    { to: "/", label: "Home" },
    ...(showAdminLink ? [{ to: "/admin", label: "Admin Dashboard" }] : []),
    { to: "/cart", label: `Cart (${itemCount})`, className: "cart-link" },
  ];

  const accountLinks = isAuthenticated
    ? [
        { to: "/orders", label: "My Orders" },
        { to: "/profile", label: "Profile" },
      ]
    : [
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
      ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          PlayStation Games
        </Link>

        <div className="nav-groups">
          <ul className={`nav-menu nav-menu-primary ${showAdminLink ? "has-admin-link" : ""}`}>
            {primaryLinks.map((link) => (
              <li key={link.to} className="nav-item">
                <Link to={link.to} className={`nav-link ${link.className || ""}`.trim()}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <button
              type="button"
              onClick={toggleTheme}
              className="nav-link theme-toggle-btn"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>

            <ul className="nav-menu nav-menu-secondary">
              {accountLinks.map((link) => (
                <li key={link.to} className="nav-item">
                  <Link to={link.to} className="nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}

              {isAuthenticated && (
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link logout-btn">
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
