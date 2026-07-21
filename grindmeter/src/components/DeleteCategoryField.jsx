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
  writeBatch,
} from "firebase/firestore";
import { FaRegTrashAlt } from "react-icons/fa";

export default function DeleteCategoryField() {
  const { categories, setCategories, currentCategory, setCurrentCategory } =
    useCategoryContext();
  const [selectedValue, setSelectedValue] = useState("");
  const [error, setError] = useState("");
  const { user } = UserAuth();

  const handleDropdownChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const handleRemove = async () => {
    if (selectedValue === "") return; // User cannot remove the default dropdown option

    setError("");

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

      // Reassign existing timer session history to "No Category"
      const timerUseRef = collection(db, `timerData/${user.email}/timerUse`);
      const timerQuery = query(
        timerUseRef,
        where("category", "==", selectedValue)
      );
      const timerSnapshot = await getDocs(timerQuery);
      const timerDocs = timerSnapshot.docs;

      for (let i = 0; i < timerDocs.length; i += 500) {
        const batch = writeBatch(db);
        timerDocs.slice(i, i + 500).forEach((timerDoc) => {
          batch.update(timerDoc.ref, { category: "None" });
        });
        await batch.commit();
      }

      console.log("Successfully removed category value");

      // Update the categories context to fit the new firestore data
      setCategories(updatedCategories);

      if (currentCategory === selectedValue) {
        setCurrentCategory("None");
      }
    } catch (error) {
      console.log("Error updating array: ", error);
      setError("Failed to delete category");
    }
  };

  // Updated the dropdown options when 'categories' changes
  useEffect(() => {
    setSelectedValue("");
  }, [categories]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-2">
        <select
          className="bg-customBlack-300 px-3 py-2 outline-none w-32 text-sm text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#70737c] border-[#494949] pr-10"
          value={selectedValue}
          onChange={handleDropdownChange}
        >
          <option></option>
          {categories.slice(1).map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button
          onClick={handleRemove}
          className="text-[#b7b7b7] hover:text-[#ff4d4d] transition-colors duration-100"
        >
          <FaRegTrashAlt />
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
