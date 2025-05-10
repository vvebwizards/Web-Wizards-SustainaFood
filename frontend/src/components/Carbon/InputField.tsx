import React from "react";
import { roleConfigs } from "../../utils/roleConfigs";
import { getUserId } from "../../utils/chatHelpers";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  required?: boolean;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "number",
  min = "0",
  max,
  required = true,
  error,
}) => {
  const { search } = useLocation();
  const { user } = useAuth();
  const currentUserId = getUserId(user);
  const params = new URLSearchParams(search);
  const initialPartner = params.get("user") || "";

  const userRole = user?.role || "donor";
  const theme =
    roleConfigs[userRole]?.theme.colors || roleConfigs.donor.theme.colors;
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
        className={`w-full px-4 py-2 rounded-lg border ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        } focus:outline-none focus:ring-2 ${
          theme.bg
        } focus:border-transparent transition-all duration-200`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputField;
