import { button } from "framer-motion/client";
import { set } from "mongoose";
import { useState } from "react";

const Input = ({ icon: Icon, See, Blind, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonHeld, setIsButtonHeld] = useState(false);

  // Handle mouse/touch hold
  const handleHoldStart = () => {
    setIsButtonHeld(true);
    setShowPassword(true);
  };

  const handleHoldEnd = () => {
    setIsButtonHeld(false);
    setShowPassword(false);
  };

  return (
    <div className="relative mb-6">
      <div className="absolute h-full left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-green-500" />
      </div>
      <input
        {...props}
        type={
          props.type === "password"
            ? showPassword
              ? "text"
              : "password"
            : props.type
        }
        className="w-full pl-10 pr-10 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200"
      />
      {props.type === "password" && props.hasValue && props.isFocused && (
        <button
          type="button"
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
        >
          {isButtonHeld ? <Blind /> : <See />}
        </button>
      )}
    </div>
  );
};
export default Input;
