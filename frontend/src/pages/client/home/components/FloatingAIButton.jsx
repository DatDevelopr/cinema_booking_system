// components/FloatingAIButton.jsx
import { Sparkles } from "lucide-react";

const FloatingAIButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group fixed bottom-6 right-6 z-40 flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-5 py-3.5 text-white shadow-lg shadow-orange-300/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-orange-400/50 active:scale-95"
    >
      {/* Hiệu ứng glow nền - pulse chậm */}
      <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-orange-400/20 blur-xl" style={{ animationDuration: "3s" }} />

      {/* Hiệu ứng vòng tròn lan tỏa */}
      <div className="absolute inset-0 -z-10 rounded-full border-2 border-orange-300/50 animate-ping" style={{ animationDuration: "2s" }} />

      {/* Hiệu ứng quỹ đạo hạt */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-orbit-1" />
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-amber-200 rounded-full animate-orbit-2" />
        <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-orange-200 rounded-full animate-orbit-3" />
      </div>

      {/* Icon với hiệu ứng xoay nhẹ */}
      <div className="relative">
        <Sparkles size={20} className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
        {/* Sparkle nhỏ xung quanh icon */}
        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" style={{ animationDuration: "1.5s" }} />
        <div className="absolute -bottom-0.5 -left-1 w-1 h-1 bg-amber-200 rounded-full animate-pulse" style={{ animationDuration: "2s" }} />
      </div>

      {/* Text với hiệu ứng gradient shift */}
      <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent animate-gradient-shift">
        Gợi ý phim
      </span>

      {/* Viền sáng khi hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* CSS animations */}
      <style>{`
        @keyframes orbit-1 {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(28px) rotate(0deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(28px) rotate(-360deg); opacity: 0.3; }
        }
        @keyframes orbit-2 {
          0% { transform: translate(-50%, -50%) rotate(90deg) translateX(22px) rotate(-90deg); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) rotate(450deg) translateX(22px) rotate(-450deg); opacity: 0.2; }
        }
        @keyframes orbit-3 {
          0% { transform: translate(-50%, -50%) rotate(180deg) translateX(32px) rotate(-180deg); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) rotate(540deg) translateX(32px) rotate(-540deg); opacity: 0.1; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-orbit-1 { animation: orbit-1 3s linear infinite; }
        .animate-orbit-2 { animation: orbit-2 4s linear infinite; }
        .animate-orbit-3 { animation: orbit-3 5s linear infinite; }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>
    </button>
  );
};

export default FloatingAIButton;