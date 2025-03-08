import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../components/Input.jsx";
import Dropdown from "../components/Dropdown.jsx";
import { Loader, Lock, Mail, SquareUser, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter.jsx";
import { useAuthStore } from "../store/authStore";
import Client from "../components/Client.jsx";
import Engineer from "../components/Engineer.jsx";

const SignUpPage = () => {
  const [role, setRole] = useState("");
  const [fname, setFName] = useState("");
  const [lname, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  const { signup, error, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      await signup(email, password, fname, lname, role, companyName);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" my-8 max-w-md w-full bg-gradient-to-b from-gray-900 to-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden "
    >
      <div className="p-8">
        <h2 className="text-3xl font-mono mb-6 text-center text-cyan-300 bg-clip-text">
          Create Account
        </h2>

        <form onSubmit={handleSignUp}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <Input
              Icon={User}
              type="text"
              placeholder="First Name"
              required
              value={fname}
              onChange={(e) => setFName(e.target.value)}
            />
            <Input
              Icon={User}
              type="text"
              placeholder="Last Name"
              required
              value={lname}
              onChange={(e) => setLName(e.target.value)}
            />
          </div>
          {/* Role Selection */}
          <Dropdown Icon={SquareUser} onChange={(value) => setRole(value)} />

          {/* Render based on selected role */}
          {role === "Client" && (
            <Client
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          )}

          {role === "Engineer" && <Engineer />}

          <Input
            Icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            Icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
          <PasswordStrengthMeter password={password} />
          <motion.button
            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold rounded-lg shadow-lg hover:from-emerald-600 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="animate-spin mx-auto" size={24} />
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>
      </div>

      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to={"/login"}
            className="text-green-400 hover:underline transition duration-500"
          >
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignUpPage;
