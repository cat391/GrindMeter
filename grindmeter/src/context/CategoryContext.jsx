/* eslint-disable react-refresh/only-export-components -- this file also exports the useCategoryContext hook; splitting it out would require updating every importer across src/ */
import { createContext, useState, useContext, useEffect } from "react";
import { UserAuth } from "./AuthContext";
import db from "../firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import PropTypes from "prop-types";
import { createUserRecords } from "../utils/categoryStore";

const CategoryContext = createContext();

export function useCategoryContext() {
  return useContext(CategoryContext);
}

export function CategoryProvider({ children }) {
  const { user } = UserAuth();
  const email = user?.email;
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("None");

  useEffect(() => {
    if (!email) {
      setCategories([]);
      setCurrentCategory("None");
      return undefined;
    }

    let creating = false;
    // Metadata changes tell us when the server confirms a cached result
    return onSnapshot(
      query(collection(db, "categories"), where("userEmail", "==", email)),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!snapshot.empty) {
          if (snapshot.size > 1) {
            console.warn("Multiple category documents found for this account");
          }
          setCategories(snapshot.docs[0].data().categories);
          return;
        }
        // Empty and cached only means the server hasn't answered yet, so an
        // existing account on a bad connection must not be treated as new.
        if (snapshot.metadata.fromCache || creating) return;
        creating = true;
        createUserRecords(email).catch((error) => {
          creating = false;
          console.error("Error creating account records: ", error);
        });
      },
      (error) => console.error("Error loading categories: ", error)
    );
  }, [email]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        currentCategory,
        setCurrentCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

CategoryProvider.propTypes = {
  children: PropTypes.node,
};
