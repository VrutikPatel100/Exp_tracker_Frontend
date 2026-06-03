import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../api/axiosInstance";

export const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post("/user/signup", data);
      toast.success(res.data?.message || "Signup successful");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error?.response ?? error)
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Signup failed. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-muted flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-bg-base border border-primary-100 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-950 mb-2">Create Account</h2>
          <p className="text-text-muted">Start tracking your expenses today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-base mb-1" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className={`w-full px-4 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 text-text-base transition-colors ${
                  errors.firstName ? "border-red-500" : "border-primary-200"
                }`}
                placeholder="First name"
                {...register("firstName", { required: "First name is required" })}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-base mb-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className={`w-full px-4 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 text-text-base transition-colors ${
                  errors.lastName ? "border-red-500" : "border-primary-200"
                }`}
                placeholder="Last name"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-base mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-4 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 text-text-base transition-colors ${
                errors.email ? "border-red-500" : "border-primary-200"
              }`}
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Entered value does not match email format",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-base mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`w-full px-4 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 text-text-base transition-colors ${
                errors.password ? "border-red-500" : "border-primary-200"
              }`}
              placeholder="Enter password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must have at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-base mb-1" htmlFor="age">
                Age
              </label>
              <input
                id="age"
                type="number"
                className="w-full px-4 py-2 bg-white border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 text-text-base transition-colors"
                placeholder="Age"
                {...register("age")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-base mb-1" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                className="w-full px-4 py-2 bg-white border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 text-text-base transition-colors"
                {...register("gender")}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 active:scale-[0.98]"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
