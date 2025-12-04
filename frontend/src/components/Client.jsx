import { motion } from "framer-motion";
import Input from "./Input";
import { Mail } from "lucide-react";
import PropTypes from "prop-types";

const Client = ({value, onChange}) => {


  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-4"
    >
      <Input
        Icon={Mail}
        type="text"
        placeholder="Company Name"
        value={value}
        onChange= {onChange}
      />
    </motion.div>
  );
};

Client.PropTypes={
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
     
}

export default Client;
