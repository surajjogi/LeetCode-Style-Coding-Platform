import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser } from "../authSlice";
import { useEffect } from "react";
import { NavLink } from "react-router";
import { toast } from "react-hot-toast";
// Simplified schema for login only
const loginSchema = z.object({
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Successfully logged in!");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const submittedData = async (data) => {
    // Simulate API call

    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Logo/Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-warning mb-2">Code/Arena</h1>
            <p className="text-gray-500">
              Welcome back! Please login to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(submittedData)} className="space-y-4">
            {/* Email Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                {...register("emailId")}
                type="email"
                placeholder="Enter your email"
                className={`input input-bordered w-full ${errors.emailId ? "input-error" : ""}`}
              />
              {errors.emailId && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.emailId.message}
                  </span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Enter your password"
                className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password.message}
                  </span>
                </label>
              )}

              {/* Forgot password link */}
              <label className="label">
                <a href="#" className="label-text-alt link link-warning">
                  Forgot password?
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-warning ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                submit
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider text-gray-400 text-sm">or continue with</div>

          {/* Social Login */}
          <div className="flex flex-col gap-2">
            <button 
              type="button"
              className="btn btn-outline w-full"
              onClick={() => toast.error("Google Auth requires a Client ID and Backend setup!")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <NavLink
              to="/Signup"
              className="link link-warning font-medium hover:link-hover"
            >
              Sign up
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
