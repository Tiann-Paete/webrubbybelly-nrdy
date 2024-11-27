import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { FaLock, FaUser } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useRouter } from "next/router";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const { query } = router;
  const [showPassword, setShowPassword] = useState(false);
  const [emailaddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/login", {
        emailaddress,
        password,
      });

      if (response.data.success) {
        router.push(query.redirect || "/letchon");
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        const message = error.response.data.error || "Invalid email or password";
        window.alert(message);
      } else {
        window.alert("An error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/check-auth");
        if (response.data.isAuthenticated) {
          router.push(query.redirect || "/letchon");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuth();
  }, [query.redirect, router]);

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center p-4" style={{ backgroundImage: "url(/Login.png)" }}>
      <Head>
        <title>Ruby Belly & Lechon - Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-orange-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Branding Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center text-white relative">
          <Image 
            src="/Vector.png" 
            width={32} 
            height={32} 
            alt="Vector Icon" 
            className="absolute top-6 left-6"
          />
          
          <div className="text-center space-y-4">
            <h3 className="text-4xl md:text-5xl font-bold">Ruby</h3>
            <h1 className="text-4xl md:text-5xl font-bold">Belly</h1>
            <h1 className="text-4xl md:text-5xl font-bold">&amp; Lechon</h1>
            <div className="flex justify-center">
              <div className="border-2 w-16 border-white"></div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Welcome!</h1>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full md:w-1/2 bg-orange-700 p-8 md:p-12 rounded-t-3xl md:rounded-l-none md:rounded-r-2xl">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Login</h2>
              <div className="border-2 w-10 border-white inline-block mt-2"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="flex items-center bg-gray-200 rounded-lg p-3 focus-within:ring-2 focus-within:ring-white">
                  <FaUser className="w-5 h-5 text-gray-500 mr-3" />
                  <input
                    type="email"
                    value={emailaddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-transparent outline-none text-black placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center bg-gray-200 rounded-lg p-3 focus-within:ring-2 focus-within:ring-white">
                  <FaLock className="w-5 h-5 text-gray-500 mr-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent outline-none text-black placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? 
                      <HiEyeOff className="w-5 h-5" /> : 
                      <HiEye className="w-5 h-5" />
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-orange-700 py-3 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white">
                Don't have an account?{" "}
                <Link href="/signup">
                  <span className="text-blue-300 hover:text-blue-500 cursor-pointer transition-colors">
                    Sign up
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;