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
import { MdOutlineChangeCircle } from "react-icons/md";

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
    <div className="flex flex-col items-center justify-center">
      <select
        className="bg-customBlack-300 opacity-75 m-2 px-3 py-1 outline-none w-30 text-sm text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#70737c] border-[#494949] pr-10 appearance-none"
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
      <form onSubmit={handleSubmit} className="relative">
        <input
          className="bg-customBlack-300 px-3 py-2 outline-none w-52 text-sm text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#70737c] border-[#494949] pr-12"
          type="text"
          placeholder="Modify Category"
          value={category}
          onChange={handleValueChange}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#b7b7b7]"
        >
          <MdOutlineChangeCircle size={25} />
        </button>
      </form>
    </div>
  );
}
