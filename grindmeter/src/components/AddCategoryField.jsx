import { useState } from "react";
import { useCategoryContext } from "../context/CategoryContext";

export default function AddCategoryField() {
  const [category, setCategory] = useState("");
  const { categories, setCategories } = useCategoryContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    setCategories([...categories, category]);
    setCategory("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        id="addCategory"
        name="addCategory"
        placeholder="Add Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      ></input>
      <button type="submit" className="text-white">
        ADD
      </button>
    </form>
  );
}
