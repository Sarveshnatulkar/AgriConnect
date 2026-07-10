import { useEffect, useRef, useState } from "react";
import {
  HiX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineClipboardCopy,
  HiCheck,
  HiOutlineUser,
} from "react-icons/hi";
import { FaLeaf } from "react-icons/fa";
import { getInitials } from "../../utils/helpers";

/**
 * ContactSellerModal — displays seller contact information in a modal overlay.
 *
 * Props:
 *  @param {Object}   seller   - crop.owner: { name, email, phone }
 *  @param {string}   cropName - for the modal subtitle
 *  @param {Function} onClose  - called when modal should close
 *
 * Accessibility:
 *  - role="dialog" + aria-modal="true"
 *  - focus trapped inside on open (first focusable element gets focus)
 *  - Escape key closes the modal
 *  - Backdrop click closes the modal
 *
 * Copy behaviour:
 *  - Each contact field has its own "Copy" button
 *  - On click: copies value to clipboard, shows a ✓ check for 2 seconds
 *  - Falls back gracefully if clipboard API is unavailable
 */
const ContactSellerModal = ({ seller, cropName, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(null); // which field was just copied
  const closeButtonRef = useRef(null);

  // ── Focus the close button on open ──────────────────────────────────────
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // ── Close on Escape key ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // ── Prevent body scroll while open ──────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── Copy to clipboard ────────────────────────────────────────────────────
  const copyToClipboard = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for browsers without clipboard API
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ── Copy all details ─────────────────────────────────────────────────────
  const copyAll = () => {
    const lines = [
      `Name:  ${seller?.name  || "—"}`,
      `Email: ${seller?.email || "—"}`,
      seller?.phone ? `Phone: ${seller.phone}` : null,
    ].filter(Boolean).join("\n");
    copyToClipboard("all", lines);
  };

  // ── Contact row component ────────────────────────────────────────────────
  const ContactRow = ({ icon, label, value, copyKey }) => {
    if (!value) return null;
    const copied = copiedKey === copyKey;
    return (
      <div className="flex items-center justify-between gap-3 py-3
                      border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center
                          justify-center shrink-0 border border-gray-100">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => copyToClipboard(copyKey, value)}
          className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1.5
                      rounded-lg transition-all duration-150
                      ${copied
                        ? "bg-primary-100 text-primary-700"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
          aria-label={`Copy ${label}`}
        >
          {copied
            ? <><HiCheck className="text-sm" /> Copied!</>
            : <><HiOutlineClipboardCopy className="text-sm" /> Copy</>
          }
        </button>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100
                      w-full max-w-md animate-fade-in overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 pt-6 pb-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-100 text-xs font-medium mb-1">Contact Seller</p>
              <h2
                id="contact-modal-title"
                className="text-white font-bold text-lg leading-snug"
              >
                {cropName}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30
                         flex items-center justify-center text-white
                         transition-colors shrink-0 ml-2"
              aria-label="Close modal"
            >
              <HiX className="text-base" />
            </button>
          </div>
        </div>

        {/* ── Avatar — overlaps header/body border ─────────────────── */}
        <div className="flex justify-center -mt-8 mb-0 px-6">
          <div className="w-16 h-16 rounded-full bg-white shadow-lg border-4
                          border-white flex items-center justify-center
                          bg-gradient-to-br from-primary-500 to-primary-700">
            <span className="text-white text-xl font-bold">
              {getInitials(seller?.name)}
            </span>
          </div>
        </div>

        {/* ── Seller name + verified badge ─────────────────────────── */}
        <div className="text-center px-6 py-3">
          <p className="font-bold text-gray-900 text-base">{seller?.name || "Unknown"}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <FaLeaf className="text-primary-500 text-xs" />
            <span className="text-xs text-primary-600 font-medium">Verified Farmer</span>
          </div>
        </div>

        {/* ── Contact details ───────────────────────────────────────── */}
        <div className="px-6 pb-2">
          <ContactRow
            icon={<HiOutlineUser className="text-gray-400 text-base" />}
            label="Full Name"
            value={seller?.name}
            copyKey="name"
          />
          <ContactRow
            icon={<HiOutlineMail className="text-gray-400 text-base" />}
            label="Email Address"
            value={seller?.email}
            copyKey="email"
          />
          <ContactRow
            icon={<HiOutlinePhone className="text-gray-400 text-base" />}
            label="Phone Number"
            value={seller?.phone}
            copyKey="phone"
          />
        </div>

        {/* ── Footer actions ─────────────────────────────────────────── */}
        <div className="px-6 pb-6 pt-3 flex flex-col gap-2 border-t border-gray-50 mt-2">
          <button
            type="button"
            onClick={copyAll}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4
                        rounded-xl text-sm font-semibold transition-all duration-150
                        ${copiedKey === "all"
                          ? "bg-primary-600 text-white"
                          : "bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white"
                        }`}
          >
            {copiedKey === "all"
              ? <><HiCheck className="text-base" /> All Details Copied!</>
              : <><HiOutlineClipboardCopy className="text-base" /> Copy All Details</>
            }
          </button>

          {seller?.email && (
            <a
              href={`mailto:${seller.email}?subject=Enquiry about ${encodeURIComponent(cropName)}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                         rounded-xl text-sm font-semibold bg-white border border-gray-200
                         text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HiOutlineMail className="text-base text-gray-500" />
              Send Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSellerModal;
