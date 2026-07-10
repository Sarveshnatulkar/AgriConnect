import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

/**
 * App.jsx — Root routing component.
 *
 * All top-level routes are defined here.
 * As phases progress, we will add:
 *  - <Route path="/login" element={<LoginPage />} />
 *  - <Route path="/register" element={<RegisterPage />} />
 *  - <Route element={<ProtectedRoute />}> ... </Route>
 *  - Role-specific dashboard routes
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default App;
