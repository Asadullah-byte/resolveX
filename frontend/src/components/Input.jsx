import PropTypes from "prop-types";

const Input = ({ Icon, ...props }) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-event-none">
        <Icon className="size-5 text-green-500" />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:ring-2  text-white placeholder-gray-400 transition duration-200"
      />
    </div>
  );
};

Input.propTypes = {
  onClick: PropTypes.func, // Example: If you expect an onClick handler
  children: PropTypes.node, // If you want to support custom text
  Icon: PropTypes.string,
};

export default Input;
