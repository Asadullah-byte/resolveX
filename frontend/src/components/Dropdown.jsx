import { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const Dropdown = ({ Icon, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Select Role");

  const roles = ["Client", "Engineer"];

  const handleSelect = (role) => {
    setSelected(role);
    setIsOpen(false);
    onChange(role);
  };

  return (
    <div className="relative mb-6 w-full  pointer-event-none">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700  text-white cursor-pointer "
      >
        <div className="flex items-center">
          <Icon className="size-5 text-green-500 mr-2" />
          <span>{selected}</span>
        </div>
        <span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
      </div>

      {/* Dropdown List with Animation */}
      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10"
        >
          {roles.map((role, index) => (
            <motion.li
              key={role}
              onClick={() => handleSelect(role)}
              className="px-4 py-2 text-white cursor-pointer hover:bg-gray-700 transition-all"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              {role}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  onChange: PropTypes.func,
  Icon: PropTypes.elementType,
};

export default Dropdown;
