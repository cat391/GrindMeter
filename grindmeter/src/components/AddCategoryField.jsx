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

export default function AddCategoryField() {
  const { categories, setCategories } = useCategoryContext();
  const [category, setCategory] = useState("");
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
      setCategories([...categories, category]);
      setCategory("");
    } catch (error) {
      console.log("Error updating document: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await updateData(user.email, category);
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
