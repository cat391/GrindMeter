import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import { createRoutesFromElements } from "react-router-dom";
import { PresetProvider } from "./context/PresetContext";
import { useEffect } from "react";
import { AuthContextProvider } from "./context/AuthContext";
import { CategoryProvider } from "./context/CategoryContext";

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
          <CategoryProvider>
            <PresetProvider>
              <RootLayout />
            </PresetProvider>
          </CategoryProvider>
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
