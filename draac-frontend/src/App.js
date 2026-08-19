import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedPage from "./pages/ProtectedPage";

function App() {
  return (
    <Routes>

        <Route
            path="/"
            element={<Login />}
        />

        <Route
            path="/dashboard"
            element={<Dashboard />}
        />

        <Route
            path="/protected"
            element={<ProtectedPage />}
        />

    </Routes>
  );
}

export default App;