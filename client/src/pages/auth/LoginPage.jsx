import { useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineAgriculture } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { ROUTES } from "../../utils/constants";
import { getErrorMessage } from "../../utils/helpers";

/**
 * LoginPage — email + password login form.
 *
 * Form state is controlled. Submission delegates to AuthContext.login()
 * which handles the API call, sets user state, shows a toast, and redirects.
 * This component only manages local form state and error display.
 *
 * Validation is intentionally simple (empty-check + length).
 * More robust validation (regex, async checks) can be added later without
 * changing the architecture.
 */
const LoginPage = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim())       newErrors.email    = "Email is required";
    if (!formData.password)           newErrors.password = "Password is required";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(formData);
      // AuthContext.login handles redirect and toast on success
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="card w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <MdOutlineAgriculture className="text-4xl text-primary-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your AgriConnect account</p>
        </div>

        {/* Form-level error */}
        {errors.form && (
          <div
            role="alert"
            className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-100"
          >
            {errors.form}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <InputField
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            disabled={loading}
          />

          <InputField
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        {/* Footer link */}
        <p className="text-sm text-center text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="text-primary-600 font-medium hover:underline"
          >
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
