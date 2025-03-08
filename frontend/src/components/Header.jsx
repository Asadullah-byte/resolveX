import { motion } from "framer-motion";
import Logo from "../assets/img/Logo.png";
import Button from "./Button";

const Header = () => {
  return (
    <motion.div
      className="fixed top-0 left-0 w-full z-50 flex justify-between pr-10  items-center py-4 bg-gray-200 bg-opacity-50 shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <img src={Logo} alt="resolvex Logo" className="h-10 w-auto pl-8 " />
      <Button value="Login" type="submit" />
    </motion.div>
  );
};

export default Header;
