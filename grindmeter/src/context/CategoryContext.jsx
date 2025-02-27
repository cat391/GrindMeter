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

  const updateCategories = async (userEmail) => {
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, where("userEmail", "==", userEmail));

    try {
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        const userData = doc.data();
        const userCategories = userData.categories;

        setCategories(userCategories);
      });

      console.log("Successfully set user's categories to ", categories);
    } catch (error) {
      console.log("Error fetching user's categories: ", error);
    }
  };

  useEffect(() => {
    if (user) {
      updateCategories(user.email);
    }
  }, [user]);

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
