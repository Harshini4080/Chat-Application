import Background from "../../assets/login.png";
import Victory from "../../assets/victory.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/lib/constants";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateLogin = () => {
    if (!email.length) return toast.error("Email is required.");
    if (!password.length) return toast.error("Password is required.");
    return true;
  };

  const validateSignup = () => {
    if (!email.length) return toast.error("Email is required.");
    if (!password.length) return toast.error("Password is required.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");
    return true;
  };

  const handleLogin = async () => {
    try {
      if (validateLogin()) {
        const response = await apiClient.post(LOGIN_ROUTE, { email, password }, { withCredentials: true });
        if (response.data.user.id) {
          setUserInfo(response.data.user);
          navigate(response.data.user.profileSetup ? "/chat" : "/profile");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignup = async () => {
    try {
      if (validateSignup()) {
        const response = await apiClient.post(SIGNUP_ROUTE, { email, password }, { withCredentials: true });
        if (response.status === 201) {
          setUserInfo(response.data.user);
          navigate("/profile");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#80deea]">
      <div className="h-[85vh] w-[90vw] md:w-[85vw] lg:w-[75vw] xl:w-[65vw] bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl grid xl:grid-cols-2 overflow-hidden">
        {/* Left Section */}
        <div className="flex flex-col gap-10 items-center justify-center px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-5xl font-extrabold text-gray-800">Welcome</h1>
              <img src={Victory} className="h-[70px]" />
            </div>
            <p className="text-gray-700 font-medium">
              Create your account and dive into real-time chats!
            </p>
          </div>

          {/* Tabs for Login/Signup */}
          <Tabs defaultValue="login" className="w-full max-w-md">
            <TabsList className="bg-white/20 backdrop-blur-lg border border-white/20 rounded-full p-1 flex justify-center w-full">
              <TabsTrigger
                className="w-1/2 text-gray-700 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-full py-2 transition-all"
                value="login"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                className="w-1/2 text-gray-700 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-full py-2 transition-all"
                value="signup"
              >
                Signup
              </TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="flex flex-col gap-5 mt-6">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-6 bg-white/80 backdrop-blur-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="rounded-full p-6 bg-white/80 backdrop-blur-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                className="rounded-full p-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold"
                onClick={handleLogin}
              >
                Login
              </Button>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup" className="flex flex-col gap-5 mt-6">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-6 bg-white/80 backdrop-blur-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="rounded-full p-6 bg-white/80 backdrop-blur-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                placeholder="Confirm Password"
                type="password"
                className="rounded-full p-6 bg-white/80 backdrop-blur-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                className="rounded-full p-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold"
                onClick={handleSignup}
              >
                Signup
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side Image */}
        <div className="hidden xl:flex justify-center items-center bg-gradient-to-br from-[#00bcd4]/30 to-[#0097a7]/30">
          <img
  src={Background}
  className="max-h-[90%] w-auto object-contain rounded-xl shadow-xl"
/>

        </div>
      </div>
    </div>
  );
};

export default Auth;
