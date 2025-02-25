import { createContext, useState, useContext, useEffect } from "react";
import { UserAuth } from "./AuthContext";
import db from "../firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";

const CategoryContext = createContext();

export function useCategoryContext() {
  return useContext(CategoryContext);
}

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        setCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}
