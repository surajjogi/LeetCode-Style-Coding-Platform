
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { registerUser } from "../authSlice";
import { useEffect } from "react";
import { NavLink } from "react-router";
import { toast } from "react-hot-toast";

const signupSchema = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  lastName: z.string().min(3, "Name should contain at least 3 characters"),
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

});

function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Account created successfully!");
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const submittedData = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch(registerUser(data))
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <h1 className="text-2xl font-bold text-center">Code/Arena</h1>
        <h1 className="text-2xl font-bold text-center">SignUp</h1>
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit(submittedData)} className="space-y-4">
            {/* First Name Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                {...register('firstName')}
                type="text"
                placeholder="Enter your full name"
                className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
              />
              {errors.firstName && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.firstName.message}
                  </span>
                </label>
              )}
            </div>
            {/*Last name field  */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                {...register('lastName')}
                type="text"
                placeholder="Enter your full name"
                className={`input input-bordered w-full ${errors.lastName ? 'input-error' : ''}`}
              />
              {errors.lastName && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.lastName.message}
                  </span>
                </label>
              )}
            </div>
            {/* Email id Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                {...register('emailId')}
                type="email"
                placeholder="Enter your email"
                className={`input input-bordered w-full ${errors.emailId ? 'input-error' : ''}`}
              />
              {errors.emailId && (
                <label className="label">
                  <span className="label-text-alt text-error">
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
                {...register('password')}
                type="password"
                placeholder="Create a password"
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password.message}
                  </span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Must be at least 8 characters
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-warning ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="divider">OR</div>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <NavLink to="/Login" className="link link-warning font-medium">
              Login
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;