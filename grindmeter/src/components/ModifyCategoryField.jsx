import { IoHandLeft } from "react-icons/io5";
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

    if (category === "") return;

    const categoriesRef = collection(db, "categories");

    console.log("Submitted");
  };

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
          placeholder="Add Category"
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
