import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const AuthButton = ({ text, handleSubmit }) => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      onClick={() => handleSubmit(navigate)}
      disabled={loading}
      className={`bg-[#232b47] border-[1px] border-gray-500 sm:w-[85%] w-[95%] rounded-lg text-lg font-semibold text-white py-1 ${
        loading ? "opacity-60 " : ""
      }`}
    >
      {loading ? "Please wait..." : text}
    </button>
  );
};

export default AuthButton;
