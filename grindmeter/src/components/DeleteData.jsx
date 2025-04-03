import { useCategoryContext } from "../context/CategoryContext";
import { useState, useEffect } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import db from "../firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { UserAuth } from "../context/AuthContext";
import { IoIosClose } from "react-icons/io";

async function deleteCategoryData(userEmail, categoryToDelete) {
  if (!userEmail) return;

  try {
    const timerUseRef = collection(db, `timerData/${userEmail}/timerUse`);

    if (categoryToDelete === "All Data") {
      const querySnapshot = await getDocs(timerUseRef);

      // Batch delete for better performance
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Deleted all ${querySnapshot.size} timer records`);
    } else {
      // Query all documents with the specified category
      const q = query(timerUseRef, where("category", "==", categoryToDelete));

      const querySnapshot = await getDocs(q);

      // Delete each matching document
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);
      console.log(
        `Deleted ${deletePromises.length} documents for category: ${categoryToDelete}`
      );
    }

    return deletePromises.length; // Return count of deleted documents
  } catch (error) {
    console.error("Error deleting category data: ", error);
    throw error;
  }
}

export default function DeleteData() {
  const [selectedValue, setSelectedValue] = useState("Fake category");
  const { categories, setCategories } = useCategoryContext();
  const [open, setOpen] = useState(false);
  const { user } = UserAuth();

  console.log(user);

  const handleDropdownChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const handleFinalRemoveDataClick = async () => {
    deleteCategoryData(user.email, selectedValue);
    setOpen(false);
  };

  return (
    <>
      <div
        className={`fixed z-50 inset-0 flex justify-center items-center transition-colors ${
          open ? "visible bg-black/40" : "invisible"
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className="bg-customBlack-200 p-6 rounded-lg relative w-[300px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-lg font-bold">Delete Data?</h1>
            <button
              className="hover:bg-customBlack-300 rounded-full p-1 -mt-2 -mr-2"
              onClick={() => setOpen(false)}
            >
              <IoIosClose size={24} />
            </button>
          </div>

          <label className="block mb-6 text-sm leading-tight">
            Are you sure you want to permanently delete
            {selectedValue === "All Data"
              ? " all your data?"
              : ` your ${selectedValue} data?`}
          </label>

          <div className="flex justify-end space-x-3">
            <button
              className="border-2 border-customBlack-400 bg-customBlack-300 text-sm py-1 px-3 rounded-md border-opacity-20 "
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="border-2 border-red-600 text-red-400 text-sm py-1 px-3 rounded-md
                 transition duration-100 ease-in-out hover:bg-red-600 hover:text-white"
              onClick={handleFinalRemoveDataClick}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <div className="bg-customBlack-200 p-6 rounded-lg h-[120px]">
        <label className="block mb-3 font-medium">Delete Data</label>
        <div className="flex items-center space-x-2">
          <select
            className="bg-customBlack-300 opacity-75 px-3 py-1 outline-none w-28 text-sm text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#70737c] border-[#494949] pr-10 appearance-none"
            value={selectedValue}
            onChange={handleDropdownChange}
          >
            <option value=""></option>
            <option value="All Data">All Data</option>
            {categories.slice(1).map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            className={`p-2 rounded-md ${
              selectedValue
                ? "hover:bg-customBlack-300 cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }`}
            onClick={() => {
              selectedValue !== "" && setOpen(true);
            }}
            disabled={!selectedValue}
          >
            <FaRegTrashAlt />
          </button>
        </div>
      </div>
    </>
  );
}
