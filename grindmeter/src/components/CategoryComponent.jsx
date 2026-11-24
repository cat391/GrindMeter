import { FiChevronDown } from "react-icons/fi";
import { useCategoryContext } from "../context/CategoryContext";
import { UserAuth } from "../context/AuthContext";

export default function CategoryComponent() {
  const { categories, currentCategory, setCurrentCategory } =
    useCategoryContext();
  const { user } = UserAuth();

  if (!user) return null;

  // The real select is invisible on top, so the label can hug the chosen name
  return (
    <label className="relative inline-flex max-w-[min(70vw,18rem)] cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-sm text-white/50 transition-colors hover:text-white [&:has(select:focus-visible)]:text-white [&:has(select:focus-visible)]:outline [&:has(select:focus-visible)]:outline-2 [&:has(select:focus-visible)]:outline-customGreen-100">
      <span className="truncate">
        {currentCategory === "None" ? "No category" : currentCategory}
      </span>
      <FiChevronDown aria-hidden="true" size={14} className="shrink-0" />
      <select
        aria-label="Category"
        value={currentCategory}
        onChange={(event) => setCurrentCategory(event.target.value)}
        className="absolute inset-0 w-full cursor-pointer appearance-none opacity-0 [color-scheme:dark]"
      >
        <option value="None">No category</option>
        {categories
          .filter((category) => category !== "None")
          .map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
      </select>
    </label>
  );
}
