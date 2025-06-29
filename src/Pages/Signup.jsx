import { useAuth } from "../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Inputs from "../Components/Inputs";
import GoogleBtn from "../Components/GoogleBtn";
import AuthButton from "../Components/AuthButton";
import { useState, useRef, useEffect } from "react";

const Signup = () => {
  const {
    signupNameRef,
    signupEmailRef,
    signupPasswordRef,
    handleSignupSubmit,
  } = useAuth();
  const navigate = useNavigate();
  const confirmPasswordRef = useRef();
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Update requirements state
    setPasswordRequirements({
      length: password.length >= minLength,
      uppercase: hasUpperCase,
      lowercase: hasLowerCase,
      number: hasNumbers,
      special: hasSpecialChar,
    });

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword) => {
    const password = signupPasswordRef.current?.value || "";
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const validateAllFields = () => {
    const name = signupNameRef.current?.value || "";
    const email = signupEmailRef.current?.value || "";
    const password = signupPasswordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";

    console.log("=== FIELD VALIDATION DEBUG ===");
    console.log("Name:", name, "Length:", name.length, "Trimmed:", name.trim().length);
    console.log("Email:", email, "Length:", email.length, "Trimmed:", email.trim().length);
    console.log("Password:", password, "Length:", password.length, "Trimmed:", password.trim().length);
    console.log("Confirm Password:", confirmPassword, "Length:", confirmPassword.length, "Trimmed:", confirmPassword.trim().length);

    const newFieldErrors = {
      name: !name.trim(),
      email: !email.trim(),
      password: !password.trim(),
      confirmPassword: !confirmPassword.trim() || (confirmPassword && confirmPassword !== password),
    };

    console.log("Field errors:", newFieldErrors);
    console.log("Any field has error:", Object.values(newFieldErrors).some(error => error));

    setFieldErrors(newFieldErrors);
    return !Object.values(newFieldErrors).some(error => error);
  };

  const handlePasswordChange = () => {
    const password = signupPasswordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";
    
    setPasswordError(validatePassword(password));
    setConfirmPasswordError(validateConfirmPassword(confirmPassword));
    
    // Update field errors for confirm password
    setFieldErrors(prev => ({
      ...prev,
      confirmPassword: !confirmPassword.trim() || (confirmPassword && confirmPassword !== password)
    }));
  };

  // Add event listeners for real-time validation
  useEffect(() => {
    const passwordInput = signupPasswordRef.current;
    const confirmPasswordInput = confirmPasswordRef.current;

    if (passwordInput) {
      passwordInput.addEventListener('input', handlePasswordChange);
    }
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', handlePasswordChange);
    }

    return () => {
      if (passwordInput) {
        passwordInput.removeEventListener('input', handlePasswordChange);
      }
      if (confirmPasswordInput) {
        confirmPasswordInput.removeEventListener('input', handlePasswordChange);
      }
    };
  }, []);

  const handleSignupClick = (navigate) => {
    console.log("=== SIGNUP BUTTON CLICKED ===");
    console.log("Navigate function:", navigate);
    
    // Validate all fields are filled
    if (!validateAllFields()) {
      console.log("❌ Field validation failed");
      return;
    }

    const password = signupPasswordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";
    
    console.log("Password length:", password.length);
    console.log("Confirm password length:", confirmPassword.length);
    
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(confirmPassword);
    
    console.log("Password validation result:", passwordValidation);
    console.log("Confirm password validation result:", confirmPasswordValidation);
    
    setPasswordError(passwordValidation);
    setConfirmPasswordError(confirmPasswordValidation);
    
    if (passwordValidation || confirmPasswordValidation) {
      console.log("❌ Password validation failed");
      return;
    }
    
    console.log("✅ All validations passed, calling handleSignupSubmit");
    // If validation passes, proceed with signup
    handleSignupSubmit(navigate);
  };

  const signupFields = [
    {
      type: "text",
      id: "Name",
      ref: signupNameRef,
      placeholder: "John Doe",
      label: "Name",
      autocomplete: "off",
      className: fieldErrors.name ? "border-red-500" : "",
    },
    {
      type: "email",
      id: "Email",
      ref: signupEmailRef,
      placeholder: "your@gmail.com",
      label: "Email",
      autocomplete: "off",
      className: fieldErrors.email ? "border-red-500" : "",
    },
    {
      type: "password",
      id: "Password",
      ref: signupPasswordRef,
      placeholder: "Create a strong password",
      label: "Password",
      autocomplete: "new-password",
      className: fieldErrors.password ? "border-red-500" : "",
    },
    {
      type: "password",
      id: "ConfirmPassword",
      ref: confirmPasswordRef,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      autocomplete: "new-password",
      className: fieldErrors.confirmPassword ? "border-red-500" : "",
    },
  ];

  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden">
      <div className="flex flex-col bg-[#040E1A] w-[94%] sm:w-[400px] items-center gap-1 py-2 rounded-xl shadow-lg shadow-blue-300 h-[95vh]">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <Inputs fields={signupFields} />
        
        {/* Password Requirements - Ultra Compact with Ticks */}
        <div className="w-full sm:w-[85%] text-xs text-gray-400">
          <p className="font-semibold mb-0.5">Requirements:</p>
          <div className="grid grid-cols-3 gap-x-1 gap-y-0 text-xs">
            <div className={`flex items-center gap-1 ${passwordRequirements.length ? 'text-green-400' : 'text-red-400'}`}>
              <span>• 8+ chars</span>
              {passwordRequirements.length && <span className="text-green-400">✓</span>}
            </div>
            <div className={`flex items-center gap-1 ${passwordRequirements.uppercase ? 'text-green-400' : 'text-red-400'}`}>
              <span>• A-Z</span>
              {passwordRequirements.uppercase && <span className="text-green-400">✓</span>}
            </div>
            <div className={`flex items-center gap-1 ${passwordRequirements.lowercase ? 'text-green-400' : 'text-red-400'}`}>
              <span>• a-z</span>
              {passwordRequirements.lowercase && <span className="text-green-400">✓</span>}
            </div>
            <div className={`flex items-center gap-1 ${passwordRequirements.number ? 'text-green-400' : 'text-red-400'}`}>
              <span>• 0-9</span>
              {passwordRequirements.number && <span className="text-green-400">✓</span>}
            </div>
            <div className={`flex items-center gap-1 ${passwordRequirements.special ? 'text-green-400' : 'text-red-400'}`}>
              <span>• !@#$%</span>
              {passwordRequirements.special && <span className="text-green-400">✓</span>}
            </div>
          </div>
        </div>

        <AuthButton text={"Sign up"} handleSubmit={handleSignupClick} />
        <p className="text-sm">
          Already have an account?
          <Link to="/login" className="text-blue-500 pl-1">
            Sign in
          </Link>
        </p>
        <div className="flex items-center sm:w-[85%] w-[95%]">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="px-3 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>
        <GoogleBtn navigate={navigate} />
      </div>
    </div>
  );
};

export default Signup;
