import { useState } from "react";
import LoginForm from "./Login";
import RegisterForm from "./Register";

export default function AuthPage() {
  const [tab, setTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3">
      <div className="w-full max-w-[420px] bg-white shadow rounded-xl overflow-hidden">

        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-3 font-semibold transition ${
              tab === "login"
                ? "bg-[#fc8905] text-white"
                : "bg-gray-100"
            }`}
          >
            ĐĂNG NHẬP
          </button>

          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-3 font-semibold transition ${
              tab === "register"
                ? "bg-[#fc8905] text-white"
                : "bg-gray-100"
            }`}
          >
            ĐĂNG KÝ
          </button>
        </div>

        <div className="p-6 animate-fade">
          {tab === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
