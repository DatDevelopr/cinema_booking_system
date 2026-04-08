// OTPInput.jsx
import { useEffect, useRef } from "react";

export default function OTPInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  error = false,
}) {
  const inputsRef = useRef([]);

  /* ===== AUTO FOCUS FIRST ===== */
  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  /* ===== CHANGE ===== */
  const handleChange = (e, index) => {
    if (disabled) return;

    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const otpArr = value.split("");
    otpArr[index] = val[0];

    onChange(otpArr.join(""));

    // focus next
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* ===== BACKSPACE ===== */
  const handleKeyDown = (e, index) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();

      const otpArr = value.split("");

      if (otpArr[index]) {
        otpArr[index] = "";
        onChange(otpArr.join(""));
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        otpArr[index - 1] = "";
        onChange(otpArr.join(""));
      }
    }
  };

  /* ===== PASTE ===== */
  const handlePaste = (e) => {
    if (disabled) return;

    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!paste) return;

    onChange(paste);
    
    // Auto focus last input after paste
    inputsRef.current[length - 1]?.focus();
  };

  return (
    <div
      className="flex justify-center gap-3"
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength="1"
          value={value[index] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`
            w-12 h-14
            text-center text-xl font-bold
            border-2 rounded-xl
            transition-all duration-200
            focus:outline-none
            ${error && !value[index] 
              ? "border-red-500 bg-red-50 animate-shake" 
              : value[index]
                ? "border-[#fc8905] bg-orange-50 shadow-md"
                : "border-gray-200 hover:border-[#fc8905]"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : "bg-white"}
            focus:ring-2 focus:ring-[#fc8905]/30 focus:border-[#fc8905]
          `}
        />
      ))}
    </div>
  );
}