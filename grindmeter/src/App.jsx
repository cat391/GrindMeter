import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import { createRoutesFromElements } from "react-router-dom";
import { PresetProvider } from "./context/PresetContext";
import { useEffect } from "react";
import { AuthContextProvider } from "./context/AuthContext";

import "./App.css";

// Pages
import Home from "./pages/Home";
import RootLayout from "./layouts/RootLayout";
import Profile from "./pages/Profile";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <AuthContextProvider>
          <PresetProvider>
            <RootLayout />
          </PresetProvider>
        </AuthContextProvider>
      }
    >
      <Route index element={<Home />} />
      <Route path="profile" element={<Profile />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
