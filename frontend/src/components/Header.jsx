import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Logo from "../assets/img/Logo.png";
import { Menu, X } from "lucide-react"; // lightweight icon set

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isCheckingAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roleBasedLinks = {
    Client: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Upload", path: "/upload" },
      { name: "Errors", path: "/files/errors" },
      { name: "Assigned", path: "/assigned" },
    ],
    Engineer: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Profile", path: "/engineer/profile" },
      { name: "Assignments", path: "/assignments" },
    ],
  };

  let buttonText, handleClick;
  if (!isAuthenticated) {
    buttonText = location.pathname === "/login" ? "Signup" : "Login";
    handleClick = () =>
      navigate(location.pathname === "/login" ? "/signup" : "/login");
  } else {
    buttonText = "Logout";
    handleClick = async () => {
      try {
        await logout?.(); // clear session and tokens
        navigate("/login");
      } catch (err) {
        console.error("Logout failed:", err);
      }
    };
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <motion.header
      className="fixed top-0 left-0 w-full z-50 bg-gray-900 bg-opacity-95 backdrop-blur-sm shadow-md px-4 py-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <motion.div
            className="p-1.5 bg-white bg-opacity-90 rounded-lg"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <img src={Logo} alt="resolvex Logo" className="h-8 w-auto" />
          </motion.div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-4 items-center">
          {isAuthenticated &&
            roleBasedLinks[user?.role]?.map((link) => (
              <Link to={link.path} key={link.path} className="relative group">
                <motion.span
                  className={`px-2.5 py-1 text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  whileHover={{ y: -1 }}
                >
                  {link.name}
                </motion.span>
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="active-link"
                    className="absolute left-1/2 bottom-0 h-0.5 w-4/5 -translate-x-1/2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </Link>
            ))}
        </nav>

        {/* Auth Button (Desktop + Mobile) */}
        <motion.button
          onClick={handleClick}
          className={`hidden md:inline px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
            isAuthenticated
              ? "bg-transparent text-red-400 hover:text-red-300 border border-red-400 hover:border-red-300"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
          }`}
          whileHover={{
            scale: 1.03,
            boxShadow: isAuthenticated
              ? "0 0 8px rgba(248, 113, 113, 0.4)"
              : "0 0 12px rgba(59, 130, 246, 0.5)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          {isCheckingAuth ? (
            <motion.div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            buttonText
          )}
        </motion.button>

        {/* Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-md text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 space-y-2"
          >
            {isAuthenticated &&
              roleBasedLinks[user?.role]?.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.path
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleClick();
              }}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                isAuthenticated
                  ? "text-red-400 hover:bg-red-500 hover:text-white"
                  : "text-white bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isCheckingAuth ? "Loading..." : buttonText}
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
