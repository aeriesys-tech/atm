import React from "react";

const variantClasses = {
  primary: "bg-[#8A0000] text-white hover:bg-[#a80606]",
  // secondary: "bg-[#FF9B45] text-white hover:bg-[#f4801b]",
  secondary: "border border-[#FF9B45] hover:bg-[#FF9B45] hover:text-white duration-300",
  bluebtn: "bg-blue-500 text-white hover:bg-blue-700",
  outline: "border border-gray-200 hover:bg-blue-100 duration-300",
};

const Button = ({
  text,
  icon,
  iconRight = false,
  className = "",
  variant = "primary",
  onClick,
}) => {
  const baseClasses =
    "flex items-center justify-center gap-2 px-4 py-1.5 rounded-md transition duration-150 cursor-pointer";
  const combined = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button onClick={onClick} className={combined}>
      {!iconRight && icon && <span className="mt-1 w-5 h-5">{icon}</span>}
      <span>{text}</span>
      {iconRight && icon && <span className="mt-1 w-5 h-5">{icon}</span>}
    </button>
  );
};

export default Button;
