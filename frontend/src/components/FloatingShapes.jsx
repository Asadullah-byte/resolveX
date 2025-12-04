import { motion } from "framer-motion";
import PropTypes from "prop-types";

const FloatingShapes = ({ color, size, top, left, delay }) => {
  return (
    <motion.div
      className={`absolute rounded-full ${color} ${size} opacity-20 blur-xl `}
      style={{ top, left }}
      animate={{
        y: ["0%", "100%", "0%"],
        x: ["0%", "100%", "0%"],
        rotate: [0, 360],
      }}
      transition={{
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        delay,
      }}
      aria-hidden="true"
    />
  );
};

FloatingShapes.propTypes = {
  color: PropTypes.string.isRequired, 
  size: PropTypes.string.isRequired,  
  top: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,  
  left: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,  
  delay: PropTypes.number.isRequired, 
};

export default FloatingShapes;
