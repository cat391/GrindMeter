import { useState } from "react";
import { useCategoryContext } from "../context/CategoryContext";
import { UserAuth } from "../context/AuthContext";
import db from "../firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";

async function checkForUserEmail(userEmail) {}

export default function AddCategoryField() {
  const [category, setCategory] = useState("");
  const { categories, setCategories } = useCategoryContext();
  const [firstCreation, setFirstCreation] = useState(true);
  const { user } = UserAuth();

  // Check if user has created a category before by checking all emails in the categories firestore
  const checkForUserEmail = async (userEmail) => {
    try {
      const querySnapshot = await getDocs(collection(db, "userEmails"));
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData === userEmail) {
          useState(false);
          console.log("adssf");
        }
      });
    } catch (error) {
      console.log("Error fetching documents: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await checkForUserEmail(user.email);

    // If user has not created a category yet, create categories for user in the categories firestore

    if (firstCreation) {
      console.log("First creation!");
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
