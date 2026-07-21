import { useState } from "react";
import { useCategoryContext } from "../context/CategoryContext";
import { UserAuth } from "../context/AuthContext";
import db from "../firebase-config";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { IoIosAddCircleOutline } from "react-icons/io";

export default function AddCategoryField() {
  const { categories, setCategories } = useCategoryContext();
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const { user } = UserAuth();

  const updateData = async (userEmail, newData) => {
    try {
      // Query for the document ID
      const q = query(
        collection(db, "categories"),
        where("userEmail", "==", userEmail)
      );
      const querySnapshot = await getDocs(q);

      // Checks if userEmail is found
      if (querySnapshot.empty) {
        console.log("No document found with the specified field value.");
        return;
      }

      // Get the document ID
      const docId = querySnapshot.docs[0].id;

      // Update document
      const docRef = doc(db, "categories", docId);
      await updateDoc(docRef, {
        categories: arrayUnion(newData),
      });
      console.log("Categories updated successfully");

      // Update the categories state to reflect the changes made
      setCategories([...categories, newData]);
      setCategory("");
    } catch (error) {
      console.log("Error updating document: ", error);
      setError("Failed to add category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = category.trim();

    if (trimmed === "") return; // Cannot add an empty category

    const reserved = ["none", "all data"];
    const isDuplicate =
      reserved.includes(trimmed.toLowerCase()) ||
      categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());

    if (isDuplicate) {
      setError("Category already exists");
      return;
    }

    await updateData(user.email, trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative w-[200px]">
        <input
          className="bg-customBlack-300 px-3 py-2 outline-none w-full text-sm text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#70737c] border-[#494949] pr-10"
          type="text"
          id="addCategory"
          placeholder="Add Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#b7b7b7]"
        >
          <IoIosAddCircleOutline size={25} className="hover:text-white" />
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </form>
  );
}
