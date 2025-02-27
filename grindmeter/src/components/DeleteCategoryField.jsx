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

export default function DeleteCategoryField() {
  const { categories, setCategories } = useCategoryContext();
  const [selectedValue, setSelectedValue] = useState("");
  const { user } = UserAuth();

  const handleDropdownChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const handleRemove = async () => {
    if (selectedValue === "") return; // User cannot remove the default dropdown option

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

      // Removes the category from the array
      let updatedCategories = [...userData.categories];
      updatedCategories = updatedCategories.filter(
        (item) => item !== selectedValue
      );

      await updateDoc(userDoc.ref, {
        categories: updatedCategories,
      });

      console.log("Successfully removed category value");

      // Update the categories context to fit the new firestore data
      setCategories(updatedCategories);
    } catch (error) {
      console.log("Error updating array: ", error);
    }

    console.log("Submitted");
  };

  // Updated the dropdown options when 'categories' changes
  useEffect(() => {
    setSelectedValue("");
  }, [categories]);

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
      <button onClick={handleRemove} className="text-white">
        REMOVE
      </button>
    </div>
  );
}
