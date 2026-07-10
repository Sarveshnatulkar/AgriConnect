import { useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineAgriculture } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { ROUTES, ROLES } from "../../utils/constants";
import { getErrorMessage } from "../../utils/helpers";

/**
 * RegisterPage — new account creation form.
 *
 * Collects: name, email, password, confirmPassword, role.
 * Role is chosen via radio-style buttons (better UX than a bare <select>).
 * Admin role is excluded — it cannot be self-registered by design.
 *
 * Submission delegates to AuthContext.register() which calls the API,
 * sets user state, shows a success toast, and redirects to the dashboard.
 */

// Roles available for self-registration (admin is excluded)
const REGISTER_ROLES = [
  { value: ROLES.FARMER,      label: "🌾 Farmer",      description: "Sell your crops" },
  { value: ROLES.BUYER,       label: "🛒 Buyer",       description: "Browse & buy crops" },
  { value: ROLES.TRANSPORTER, label: "🚛 Transporter", description: "Deliver orders" },
];

const RegisterPage = () => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name:            "",
    email:           "",
    password:        "",
    confirmPassword: "",
    role:            ROLES.BUYER, // sensible default
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.password)
      newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.role)
      newErrors.role = "Please select a role";

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
      // Do not send confirmPassword to the backend
      const { confirmPassword, ...payload } = formData;
      await register(payload);
      // AuthContext.register handles redirect and toast
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="card w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <MdOutlineAgriculture className="text-4xl text-primary-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join the AgriConnect ecosystem</p>
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

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          <InputField
            id="name"
            name="name"
            label="Full name"
            placeholder="John Farmer"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            disabled={loading}
          />

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
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            disabled={loading}
          />

          <InputField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            disabled={loading}
          />

          {/* Role selector */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              I am a… <span className="text-red-500">*</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {REGISTER_ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-colors text-center
                    ${formData.role === r.value
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={formData.role === r.value}
                    onChange={handleChange}
                    disabled={loading}
                    className="sr-only"   /* visually hidden — the label acts as the control */
                  />
                  <span className="text-xl">{r.label.split(" ")[0]}</span>
                  <span className="text-xs font-medium leading-none">
                    {r.label.split(" ").slice(1).join(" ")}
                  </span>
                  <span className="text-xs text-gray-400">{r.description}</span>
                </label>
              ))}
            </div>
            {errors.role && (
              <p role="alert" className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="text-primary-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
