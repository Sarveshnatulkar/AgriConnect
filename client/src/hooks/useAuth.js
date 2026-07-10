/**
 * useAuth hook — re-exported from AuthContext for a cleaner import path.
 *
 * Instead of:
 *   import { useAuth } from "../context/AuthContext";
 *
 * Components can write:
 *   import useAuth from "../hooks/useAuth";
 *
 * This decouples components from the context file location.
 * If we ever move or restructure AuthContext, only this file changes.
 */
export { useAuth as default } from "../context/AuthContext";
