import { useCategoryContext } from "../context/CategoryContext";
import { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";

export default function CategoryComponent() {
  const { categories, setCategories, currentCategory, setCurrentCategory } =
    useCategoryContext();
  const { user } = UserAuth();

  const [selectedValue, setSelectedValue] = useState(currentCategory);

  const handleDropdownChange = (e) => {
    setSelectedValue(e.target.value);
    setCurrentCategory(e.target.value);
  };

  return (
    <>
      {user && (
        <select
          className="bg-customBlack-300 m-1 px-3 py-1 outline-none w-28 text-xs text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#70737c] border-[#494949] pr-10 appearance-none"
          value={selectedValue}
          onChange={handleDropdownChange}
        >
          <option>None</option>
          {categories.slice(1).map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
