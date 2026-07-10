import { useState, useRef } from "react";
import {
  HiOutlineUser, HiOutlinePencilAlt, HiOutlineLockClosed,
  HiOutlineCamera, HiOutlinePhone, HiOutlineMail,
  HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineBadgeCheck,
  HiX,
} from "react-icons/hi";
import { FaSeedling } from "react-icons/fa";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { updateUserProfile, changeUserPassword } from "../../services/userService";
import { uploadImageToCloudinary } from "../../services/cropService";
import { formatDate, capitalise, getInitials, getErrorMessage } from "../../utils/helpers";

/**
 * ProfilePage — three-tab page: View Profile, Edit Profile, Change Password.
 *
 * Route:  /profile
 * Access: Any authenticated user
 *
 * Tabs:
 *  1. Profile   — read-only summary (avatar, name, email, role, address, joined)
 *  2. Edit      — update name, phone, address, avatar (Cloudinary upload)
 *  3. Password  — change password with current password verification
 *
 * After a successful profile update, AuthContext.updateUser() is called so
 * the Navbar reflects the new name/avatar immediately.
 */

const TABS = [
  { id: "view",     label: "Profile",         icon: <HiOutlineUser className="text-base" /> },
  { id: "edit",     label: "Edit Profile",    icon: <HiOutlinePencilAlt className="text-base" /> },
  { id: "password", label: "Change Password", icon: <HiOutlineLockClosed className="text-base" /> },
];

const ROLE_COLOURS = {
  farmer:      "bg-primary-100 text-primary-700 border-primary-200",
  buyer:       "bg-blue-100 text-blue-700 border-blue-200",
  transporter: "bg-orange-100 text-orange-700 border-orange-200",
  admin:       "bg-purple-100 text-purple-700 border-purple-200",
};

// ── View Tab ──────────────────────────────────────────────────────────────────
const ViewProfile = ({ user, onEditClick }) => {
  const InfoRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">{label}</p>
          <p className="text-sm font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    );
  };

  const addrParts = [
    user.address?.street, user.address?.city,
    user.address?.state,  user.address?.pincode,
    user.address?.country,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar card */}
      <div className="card flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-primary-50 to-white border-primary-100">
        <div className="relative shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                            flex items-center justify-center text-white text-3xl font-bold
                            border-4 border-white shadow-md">
              {getInitials(user.name)}
            </div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ROLE_COLOURS[user.role] || "bg-gray-100 text-gray-600"}`}>
              {capitalise(user.role)}
            </span>
            {user.isActive && (
              <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                <HiOutlineBadgeCheck className="text-sm" /> Active
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="sm:ml-auto btn-secondary text-sm flex items-center gap-1.5 self-start sm:self-center"
        >
          <HiOutlinePencilAlt className="text-base" /> Edit Profile
        </button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold text-gray-700 text-sm mb-1">Contact Information</h3>
          <InfoRow icon={<HiOutlineMail className="text-gray-400 text-sm" />}    label="Email"  value={user.email} />
          <InfoRow icon={<HiOutlinePhone className="text-gray-400 text-sm" />}   label="Phone"  value={user.phone || "Not provided"} />
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 text-sm mb-1">Account Details</h3>
          <InfoRow icon={<HiOutlineBadgeCheck className="text-gray-400 text-sm" />} label="Role"   value={capitalise(user.role)} />
          <InfoRow icon={<HiOutlineCalendar className="text-gray-400 text-sm" />}   label="Joined" value={formatDate(user.createdAt)} />
          <InfoRow icon={<HiOutlineCalendar className="text-gray-400 text-sm" />}   label="Last Login" value={user.lastLogin ? formatDate(user.lastLogin) : "—"} />
        </div>
        {addrParts.length > 0 && (
          <div className="card sm:col-span-2">
            <h3 className="font-semibold text-gray-700 text-sm mb-1">Address</h3>
            <InfoRow
              icon={<HiOutlineLocationMarker className="text-gray-400 text-sm" />}
              label="Full Address"
              value={addrParts.join(", ")}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Edit Tab ──────────────────────────────────────────────────────────────────
const EditProfile = ({ user, onSave }) => {
  const [form, setForm] = useState({
    name:    user.name    || "",
    phone:   user.phone   || "",
    street:  user.address?.street  || "",
    city:    user.address?.city    || "",
    state:   user.address?.state   || "",
    pincode: user.address?.pincode || "",
    country: user.address?.country || "India",
  });
  const [errors,         setErrors]         = useState({});
  const [submitting,     setSubmitting]      = useState(false);
  const [avatarFile,     setAvatarFile]      = useState(null);
  const [avatarPreview,  setAvatarPreview]   = useState(user.avatar || null);
  const [uploadingAvatar,setUploadingAvatar] = useState(false);
  const [avatarError,    setAvatarError]     = useState(null);
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAvatarError("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024)    { setAvatarError("Image must be smaller than 5 MB"); return; }
    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.name.trim().length > 50) e.name = "Name cannot exceed 50 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }

    setSubmitting(true);
    try {
      let avatarUrl = user.avatar || null;

      // Upload avatar to Cloudinary if a new file was chosen
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          const uploaded = await uploadImageToCloudinary(avatarFile);
          avatarUrl = uploaded.url;
        } catch (err) {
          setAvatarError(getErrorMessage(err));
          setSubmitting(false);
          setUploadingAvatar(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      const payload = {
        name:  form.name.trim(),
        phone: form.phone.trim() || null,
        avatar: avatarUrl,
        address: {
          street:  form.street.trim(),
          city:    form.city.trim(),
          state:   form.state.trim(),
          pincode: form.pincode.trim(),
          country: form.country.trim() || "India",
        },
      };

      const res = await updateUserProfile(payload);
      toast.success("Profile updated successfully!");
      onSave(res.data.user);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || uploadingAvatar;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Avatar upload */}
        <div className="card flex flex-col items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                              flex items-center justify-center text-white text-4xl font-bold
                              border-4 border-white shadow-md">
                {getInitials(user.name)}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={isBusy}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full
                         flex items-center justify-center text-white shadow-md
                         hover:bg-primary-700 transition-colors">
              <HiOutlineCamera className="text-sm" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange}
            disabled={isBusy} className="sr-only" aria-label="Upload avatar" />
          <p className="text-xs text-gray-400 text-center">JPG, PNG or WebP · max 5 MB</p>
          {uploadingAvatar && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Spinner size="w-3 h-3" /> Uploading…
            </div>
          )}
          {avatarError && <p role="alert" className="text-xs text-red-500 text-center">{avatarError}</p>}
          {avatarPreview && avatarPreview !== user.avatar && (
            <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(user.avatar || null); }}
              disabled={isBusy}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
              <HiX className="text-xs" /> Remove new photo
            </button>
          )}
        </div>

        {/* Form fields */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="card flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800 text-sm">Personal Information</h3>
            <InputField id="name" name="name" label="Full Name" value={form.name}
              onChange={handleChange} error={errors.name} required disabled={isBusy} />
            <InputField id="phone" name="phone" label="Phone Number" placeholder="+91 9876543210"
              value={form.phone} onChange={handleChange} disabled={isBusy} />
          </div>

          <div className="card flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800 text-sm">Address</h3>
            <InputField id="street" name="street" label="Street / Area"
              placeholder="e.g. 123 Farm Road" value={form.street} onChange={handleChange} disabled={isBusy} />
            <div className="grid grid-cols-2 gap-4">
              <InputField id="city"    name="city"    label="City"    placeholder="e.g. Amritsar"
                value={form.city}    onChange={handleChange} disabled={isBusy} />
              <InputField id="state"   name="state"   label="State"   placeholder="e.g. Punjab"
                value={form.state}   onChange={handleChange} disabled={isBusy} />
              <InputField id="pincode" name="pincode" label="PIN Code" placeholder="e.g. 143001"
                value={form.pincode} onChange={handleChange} disabled={isBusy} />
              <InputField id="country" name="country" label="Country"
                value={form.country} onChange={handleChange} disabled={isBusy} />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="submit" variant="primary" loading={isBusy} className="px-8">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

// ── Password Tab ──────────────────────────────────────────────────────────────
const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setSuccess(false);
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword)             e.currentPassword = "Current password is required";
    if (!form.newPassword)                 e.newPassword     = "New password is required";
    else if (form.newPassword.length < 8)  e.newPassword     = "Password must be at least 8 characters";
    if (form.newPassword !== form.confirmPassword)
                                           e.confirmPassword = "Passwords do not match";
    if (form.currentPassword === form.newPassword && form.newPassword)
                                           e.newPassword     = "New password must differ from current";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }

    setSubmitting(true);
    try {
      await changeUserPassword(form);
      toast.success("Password changed successfully!");
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = getErrorMessage(err);
      // Map backend error to the right field
      if (msg.toLowerCase().includes("current")) {
        setErrors({ currentPassword: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm
                        px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <HiOutlineBadgeCheck className="text-base shrink-0" />
          Password changed successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card flex flex-col gap-5">
        <div>
          <h3 className="font-semibold text-gray-800">Change Password</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Use a strong password of at least 8 characters.
          </p>
        </div>

        <InputField id="currentPassword" name="currentPassword" type="password"
          label="Current Password" placeholder="Enter your current password"
          value={form.currentPassword} onChange={handleChange}
          error={errors.currentPassword} required disabled={submitting} />

        <InputField id="newPassword" name="newPassword" type="password"
          label="New Password" placeholder="Min. 8 characters"
          value={form.newPassword} onChange={handleChange}
          error={errors.newPassword} required disabled={submitting} />

        <InputField id="confirmPassword" name="confirmPassword" type="password"
          label="Confirm New Password" placeholder="Re-enter new password"
          value={form.confirmPassword} onChange={handleChange}
          error={errors.confirmPassword} required disabled={submitting} />

        <Button type="submit" variant="primary" loading={submitting} className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("view");

  if (!user) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="w-10 h-10" />
      </div>
    );
  }

  const handleProfileSaved = (updatedUser) => {
    updateUser(updatedUser);
    setActiveTab("view");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account information</p>
      </div>

      {/* Tab bar */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 py-2.5 px-4
                        text-sm font-semibold rounded-lg transition-all duration-150
                        ${activeTab === tab.id
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === "view" && (
          <ViewProfile user={user} onEditClick={() => setActiveTab("edit")} />
        )}
        {activeTab === "edit" && (
          <EditProfile user={user} onSave={handleProfileSaved} />
        )}
        {activeTab === "password" && (
          <ChangePassword />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
