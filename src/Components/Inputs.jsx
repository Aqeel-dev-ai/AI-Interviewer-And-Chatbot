import { useState } from "react";

const Inputs = ({ fields }) => {
  const [showPasswords, setShowPasswords] = useState({});

  const togglePasswordVisibility = (fieldId) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  return (
    <>
      {fields.map((input, index) => {
        const isPassword = input.type === "password";
        const showPassword = showPasswords[input.id];
        
        return (
          <div className="w-full flex items-center flex-col gap-3" key={index}>
            <label
              htmlFor={input.label}
              className="self-start sm:pl-8 pl-3 text-gray-300"
            >
              {input.label}
            </label>
            <div className="relative sm:w-[85%] w-[92%]">
              <input
                id={input.id}
                ref={input.ref}
                type={isPassword && showPassword ? "text" : input.type}
                placeholder={input.placeholder}
                autoComplete={input.autocomplete}
                className={`w-full bg-[#232b47] border-[1px] border-solid rounded-lg px-4 py-2 outline-none pr-12 ${
                  input.className ? input.className : 'border-blue-700'
                }`}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(input.id)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-md transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Inputs;
