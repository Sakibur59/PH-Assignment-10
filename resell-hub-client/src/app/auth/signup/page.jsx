"use client";

import { useState } from "react";
import { Card, Button, Link, TextField, Label, Input } from "@heroui/react";

import { Eye, EyeSlash, Briefcase, Bucket } from "@gravity-ui/icons";

import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignupForm({ redirectTo = "/auth/signin" }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp.email({
        email,
        password,
        name,
        role,
        phone,
        location,
      });

      if (error) {
        toast.error(error.message || "Something went wrong");
        return;
      }

      toast.success("Welcome to ReSell Hub 🚀");
      router.push(redirectTo);
    } catch (err) {
      toast.error("Unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12">
      <Card className="w-full max-w-md p-8 rounded-3xl border-0 bg-white/80 backdrop-blur-sm shadow-2xl shadow-emerald-100/50">
        {/* HEADER */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-bold text-2xl shadow-lg shadow-emerald-200">
              R
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 animate-pulse"></div>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                ReSell Hub
              </h1>
              <p className="text-xs text-gray-400 font-medium tracking-wider">
                MARKETPLACE
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1 font-light">
            Start your journey with us
          </p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-6 w-full">
          {/* ROLE SELECT */}
          <div className="flex flex-col gap-2 w-full">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              I want to
            </Label>
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* BUYER */}
              <div
                onClick={() => setRole("buyer")}
                className={`cursor-pointer rounded-2xl border-2 p-4 text-center transition-all duration-200 w-full ${
                  role === "buyer"
                    ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100 scale-[1.02]"
                    : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                }`}
              >
                <Bucket className={`mx-auto mb-2 h-5 w-5 ${role === "buyer" ? "text-emerald-600" : "text-gray-400"}`} />
                <p className={`font-semibold ${role === "buyer" ? "text-gray-900" : "text-gray-600"}`}>Buyer</p>
                <p className="text-xs text-gray-400">Browse & buy</p>
              </div>

              {/* SELLER */}
              <div
                onClick={() => setRole("seller")}
                className={`cursor-pointer rounded-2xl border-2 p-4 text-center transition-all duration-200 w-full ${
                  role === "seller"
                    ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-100 scale-[1.02]"
                    : "border-gray-200 hover:border-amber-300 hover:bg-gray-50"
                }`}
              >
                <Briefcase className={`mx-auto mb-2 h-5 w-5 ${role === "seller" ? "text-amber-600" : "text-gray-400"}`} />
                <p className={`font-semibold ${role === "seller" ? "text-gray-900" : "text-gray-600"}`}>Seller</p>
                <p className="text-xs text-gray-400">Sell items</p>
              </div>
            </div>
          </div>

          {/* NAME + PHONE */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="w-full">
              <Label className="text-sm font-medium text-gray-600">Full Name</Label>
              <Input
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border-gray-200 focus:border-emerald-400 transition-colors"
                placeholder="John Doe"
                size="lg"
              />
            </div>

            <div className="w-full">
              <Label className="text-sm font-medium text-gray-600">Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border-gray-200 focus:border-emerald-400 transition-colors"
                placeholder="+880 1234 567890"
                size="lg"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="w-full">
            <Label className="text-sm font-medium text-gray-600">Email Address</Label>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border-gray-200 focus:border-emerald-400 transition-colors"
              placeholder="you@example.com"
              size="lg"
            />
          </div>

          {/* LOCATION */}
          <div className="w-full">
            <Label className="text-sm font-medium text-gray-600">Location</Label>
            <Input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1.5 w-full rounded-xl border-gray-200 focus:border-emerald-400 transition-colors"
              placeholder="Dhaka, Bangladesh"
              size="lg"
            />
          </div>

          {/* PASSWORD */}
          <div className="w-full">
            <Label className="text-sm font-medium text-gray-600">Password</Label>
            <div className="relative mt-1.5 w-full">
              <Input
                required
                type={isVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-gray-200 focus:border-emerald-400 pr-12 transition-colors"
                placeholder="Min 6 characters"
                size="lg"
              />
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 focus:outline-none transition-colors"
              >
                {isVisible ? (
                  <EyeSlash className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            isLoading={isLoading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold hover:from-emerald-600 hover:to-teal-500 shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-300 hover:scale-[1.02] mt-2"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* DIVIDER */}
          <div className="relative flex py-1 items-center text-gray-400 text-xs uppercase w-full">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 font-medium">or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* GOOGLE SIGN IN BUTTON */}
          <Button
            type="button"
            variant="bordered"
            className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-3 font-medium transition-all duration-200"
          >
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              focusable="false"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="#4285F4"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Continue with Google
          </Button>

          {/* FOOTER */}
          <p className="text-center text-sm text-gray-500 pt-2">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Sign in →
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}