import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen ">
      {/* Left panel */}
      <div  className="w-full bg-[url('/assets/LoginPage/bgimg1.png')] bg-cover  lg:w-[45%] p-8 flex flex-col justify-center   bg-[#111111]  ">
        <div className="max-w-md flex flex-col  gap-[13rem]">
        <div className="w-[400px] h-[166px]">
          <h1 className="text-[40px] leading-[3rem] font-outfit font-bold text-white ">
            Welcome to FimIt Admin Panel
          </h1>
          <p className="text-lg font-PlusJakarta text-gray-300 ">
            Sign in to manage users, floor plans, and scan data securely.
          </p>
          </div>

          {/* Image gallery */}
          <div className="relative   ">
            <div className="absolute bottom-48  w-[382px] h-[230px] rounded-lg overflow-hidden shadow-lg transform ">
              <img
                src="/assets/LoginPage/img1.png"
                alt="Interior preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative  w-[382px] h-[230px] rounded-lg overflow-hidden shadow-lg ml-auto ">
              <img
                src="/assets/LoginPage/img2.png"
                alt="Room preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="hidden lg:flex lg:flex-col lg:w-[65%] items-center justify-center gap-10 bg-[url('/assets/LoginPage/bgimg1.png')] bg-cover bg-[#090D00]  ">
        <div className="flex items-center justify-center ">
          <div className="flex items-center justify-center gap-1">
            <img className="w-[72px] h-[72px]" src="/assets/logo.png" />
            <div className="text-white font-SfProDisplay font-[400] text-3xl ml-2">
              FIMIT
            </div>
          </div>
        </div>
        <div className="w-full max-w-[440px] h-[474px] bg-[#1E3A5F] rounded-lg p-8 shadow-xl">
          <h2 className="text-[40px] font-bold font-outfit text-white mb-8 text-center">
            Sign In
          </h2>

          <form className="space-y-4 font-SfProDisplay">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-[16px] bg-[#1E3A5F] text-white p-4 border border-white placeholder:text-white"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-[16px] bg-[#1E3A5F] text-white p-4 border border-white placeholder:text-white"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-[#1E3A5F] rounded-full py-4 font-[500] text-[16px]"
            >
              Sign in
            </button>

            <div className="text-center mt-4">
              <a href="#" className="text-white hover:underline text-sm">
                Forgot Password?
              </a>
            </div>
          </form>

          <div className="mt-8 text-center font-PlusJakarta text-sm text-[#B1B2AE]">
            <p>Sign in using your email and password.</p>
            <p className="mt-1">
              Don't have an account?{" "}
              <a href="#" className="font-[500] hover:underline text-white">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
