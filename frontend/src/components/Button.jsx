import PropTypes from "prop-types";
import { motion } from "framer-motion";

const Button = (props) => {
  return (
    <>
      <motion.button
        className=" py-2 px-5 bg-gradient-to-r from-gray-950 via-gray-700 to-gray-400 text-white rounded-lg shadow-lg hover:bg-blue-900 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        
      >
        {props.value}
      </motion.button>
    </>
  );
};

Button.propTypes = {
    onClick: PropTypes.func, // Example: If you expect an onClick handler
    children: PropTypes.node, // If you want to support custom text
    value: PropTypes.string
};

export default Button;
