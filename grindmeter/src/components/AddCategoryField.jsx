import { useState } from "react";
import { useCategoryContext } from "../context/CategoryContext";
import { UserAuth } from "../context/AuthContext";
import db from "../firebase-config";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

async function checkForUserEmail(userEmail) {}

export default function AddCategoryField() {
  const [category, setCategory] = useState("");
  const { categories, setCategories } = useCategoryContext();
  const [firstCreation, setFirstCreation] = useState(true);
  const { user } = UserAuth();

  // Check if user has created a category before by checking all emails in the categories firestore
  const checkForUserEmail = async (userEmail) => {
    try {
      const q = query(
        collection(db, "categories"),
        where("userEmail", "==", userEmail)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setFirstCreation(false);
      }
    } catch (error) {
      console.log("Error fetching documents: ", error);
    }
  };

  const createCategoriesForUse = async (userEmail) => {
    try {
      await addDoc(collection(db, "categories"), {
        userEmail: userEmail,
        categories: ["None"],
      });
      console.log("Created categories for ", userEmail);
    } catch (error) {
      console.log("Error adding document: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await checkForUserEmail(user.email);

    // If user has not created a category yet, create categories for user in the categories firestore
    if (firstCreation) {
      await createCategoriesForUse(user.email);
      setFirstCreation(false);
    } else {
      console.log("Have already created");
    }

    // setCategories([...categories, category]);
    // setCategory("");
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
