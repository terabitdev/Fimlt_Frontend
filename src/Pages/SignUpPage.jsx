import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { Link } from "react-router";
function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="min-h-screen">
      {/* SignUp Form */}
      <div className=" flex flex-col lg:w-full h-full lg:h-full items-center lg:p-8  justify-center gap-10 bg-[url('/assets/LoginPage/bgimg1.png')] bg-cover bg-[#090D00]  ">   
          <div className="flex items-center justify-center gap-2 mt-10">
            <img className="w-[72px] h-[72px]" src="/assets/logo.png" />
            <div className="text-white font-SfProDisplay font-[400] text-3xl ">
              FIMIT
            </div>
        </div>
        <div className="w-full max-w-[440px] h-[564px] bg-[#1E3A5F] rounded-2xl p-8 shadow-xl">
          <h2 className="text-[40px] font-bold font-outfit text-white mb-8 text-center">
          Sign Up
          </h2>

          <form className="space-y-4 font-SfProDisplay">
          <div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-[16px] bg-[#1E3A5F] text-white p-4 border border-white placeholder:text-white"
              />
            </div>
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

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
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
              className="w-full bg-white text-[#1E3A5F] rounded-full py-4 font-[500] text-[18px] "
            >
              Sign Up
            </button>
          </form>

          <div className="mt-8 text-center font-PlusJakarta text-sm text-[#B1B2AE]">  
            <p className="mt-1">
            Already have an account? 
              <Link to={"/"} className="font-[500] ml-2 hover:underline text-white">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
