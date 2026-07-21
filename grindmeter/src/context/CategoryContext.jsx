import { createContext, useState, useContext, useEffect } from "react";
import { UserAuth } from "./AuthContext";
import db from "../firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";

const CategoryContext = createContext();

export function useCategoryContext() {
  return useContext(CategoryContext);
}

export function CategoryProvider({ children }) {
  const { user } = UserAuth();
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("None");

  const updateCategories = async (userEmail) => {
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, where("userEmail", "==", userEmail));

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setCategories([]);
        setCurrentCategory("None");
        return;
      }

      if (querySnapshot.size > 1) {
        console.warn("Multiple category documents found for ", userEmail);
      }

      const userData = querySnapshot.docs[0].data();
      setCategories(userData.categories);
    } catch (error) {
      console.log("Error fetching user's categories: ", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      updateCategories(user.email);
    } else {
      setCategories([]);
      setCurrentCategory("None");
    }
  }, [user]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        setCategories,
        currentCategory,
        setCurrentCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}
