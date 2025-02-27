import { IoHandLeft } from "react-icons/io5";
import { useCategoryContext } from "../context/CategoryContext";
import { useState, useEffect } from "react";

export function ModifyCategoryField() {
  const { categories, setCategories } = useCategoryContext();
  const [selectedValue, setSelectedValue] = useState("");
  const [category, setCategory] = useState(selectedValue);

  const handleDropdownChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const handleValueChange = (e) => {
    setCategory(e.target.value);
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
      <form>
        <input
          type="text"
          placeholder="Add Category"
          value={category}
          onChange={handleDropdownChange}
        ></input>
        <button type="submit" className="text-white">
          MODIFY
        </button>
      </form>
    </div>
  );
}
