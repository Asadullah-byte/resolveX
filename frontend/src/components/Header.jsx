import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/img/Logo.png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the button text and redirection based on the current path
  let buttonText, buttonAction;

  if (location.pathname === "/login") {
    buttonText = "Signup";
    buttonAction = "/signup";
  } else if (location.pathname === "/signup") {
    buttonText = "Login";
    buttonAction = "/login";
  } else {
    buttonText = "Logout";
    buttonAction = "/logout";
  }

  return (
    <motion.div
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center py-4 px-6 bg-gray-200 bg-opacity-50 shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {/* Logo */}
      <Link to="/">
        <img src={Logo} alt="resolvex Logo" className="h-10 w-auto" />
      </Link>

      {/* Navigation Button */}
      <Link to={buttonAction}>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          {buttonText}
        </button>
      </Link>
    </motion.div>
  );
};

export default Header;
