import { useCategoryContext } from "../context/CategoryContext";
import { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import db from "../firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export function ModifyCategoryField() {
  const { categories, setCategories } = useCategoryContext();
  const [selectedValue, setSelectedValue] = useState("");
  const [category, setCategory] = useState(selectedValue);
  const { user } = UserAuth();

  const handleDropdownChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const handleValueChange = (e) => {
    if (selectedValue !== "") {
      setCategory(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (category === "") return; // User cannot modify a category into a blank string

    try {
      // Query to find user's specific categories with their email
      const q = query(
        collection(db, "categories"),
        where("userEmail", "==", user.email)
      );

      const querySnapshot = await getDocs(q);

      // Handle cases when user's categories cannot be found
      if (querySnapshot.empty) {
        console.log("No user found with email: ", user.email);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Gathers index of the category user wants to change
      const indexToUpdate = userData.categories.indexOf(selectedValue);

      // Handles cases when category user wants to change cannot be found
      if (indexToUpdate === -1) {
        console.log("No category found with name ", selectedValue);
        return;
      }

      // Updates the categories in firestore array accordingly
      const updatedCategories = [...userData.categories];
      updatedCategories[indexToUpdate] = category;

      await updateDoc(userDoc.ref, {
        categories: updatedCategories,
      });

      console.log("Successfully updated category value");

      // Update the categories context to fit the new firestore data
      setCategories(updatedCategories);
    } catch (error) {
      console.log("Error updating array: ", error);
    }
  };

  // Updated the dropdown options when 'categories' changes
  useEffect(() => {
    setCategory("");
    setSelectedValue("");
  }, [categories]);

  useEffect(() => {
    setCategory(selectedValue);
  }, [selectedValue]);

  // Fix this so it handles the case if no categories are added yet
  return (
    <div>
      <select value={selectedValue} onChange={handleDropdownChange}>
        <option></option>
        {categories.slice(1).map((category, index) => (
          <option key={index} value={category}>
            {category}
          </option>
        ))}
      </select>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Modify Category"
          value={category}
          onChange={handleValueChange}
        ></input>
        <button type="submit" className="text-white">
          MODIFY
        </button>
      </form>
    </div>
  );
}
