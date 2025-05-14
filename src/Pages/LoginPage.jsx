
import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; 

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Navigate to dashboard after successful login
      navigate("/dashboard"); // Adjust the route as needed
      
    } catch (error) {
      console.error("Error signing in:", error);
      
      // Handle Firebase auth errors
      if (error.code === "auth/user-not-found") {
        setErrors({ email: "No user found with this email" });
      } else if (error.code === "auth/wrong-password") {
        setErrors({ password: "Incorrect password" });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Invalid email address" });
      } else if (error.code === "auth/too-many-requests") {
        setErrors({ general: "Too many failed attempts. Please try again later." });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex lg:flex-row flex-col  min-h-screen ">
      {/* Left panel */}
      <div  className="w-full bg-[url('/assets/LoginPage/bgimg1.png')] bg-cover  lg:w-[45%] py-4 md:py-8 md:p-8 flex flex-col justify-center   bg-[#111111]  ">
        <div className="max-w-md flex flex-col  gap-[13rem]">
        <div className="w-[400px] h-[166px]">
          <h1 className="text-3xl text-center md:text-left md:text-[40px] leading-[3rem] font-outfit font-bold text-white ">
            Welcome to FimIt Admin Panel
          </h1>
          <p className="text-lg text-center md:text-left p-4 md:p-0 font-PlusJakarta text-gray-300 ">
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
      <div className="lg:flex lg:flex-col lg:w-[65%] items-center justify-center gap-10 bg-[url('/assets/LoginPage/bgimg1.png')] bg-cover bg-[#090D00]  ">
        <div className="flex items-center justify-center ">
          <div className="flex items-center justify-center gap-1">
            <img className="w-[72px] h-[72px]" src="/assets/logo.png" />
            <div className="text-white font-SfProDisplay font-[400] text-3xl ml-2">
              FIMIT
            </div>
          </div>
        </div>
        <div className="w-full max-w-[440px] h-auto bg-[#1E3A5F] rounded-2xl p-8 shadow-xl">
          <h2 className="text-[40px] font-bold font-outfit text-white mb-8 text-center">
            Sign In
          </h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-SfProDisplay">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full rounded-[16px] bg-[#1E3A5F] text-white p-4 border placeholder:text-white ${
                  errors.email ? 'border-red-500' : 'border-white'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full rounded-[16px] bg-[#1E3A5F] text-white p-4 border placeholder:text-white pr-12 ${
                  errors.password ? 'border-red-500' : 'border-white'
                }`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-full py-4 font-[500] text-[18px] transition-all ${
                loading 
                  ? 'bg-gray-400 text-[#1E3A5F] cursor-not-allowed' 
                  : 'bg-white text-[#1E3A5F] hover:bg-gray-100'
              }`}
            >
              {loading ? "Signing in..." : "Sign in"}
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
                <Link to="/signup" className="font-[500] hover:underline text-white">
                    Sign up
                </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;