import { useCategoryContext } from "../context/CategoryContext";
import { useRef, useState } from "react";
import PropTypes from "prop-types";
import db from "../firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { UserAuth } from "../context/AuthContext";

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

      return querySnapshot.size;
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

      return deletePromises.length;
    }
  } catch (error) {
    console.error("Error deleting category data: ", error);
    throw error;
  }
}

const describeTarget = (value) => {
  if (value === "All Data") return "all your timer data";
  return `your ${value === "None" ? "No Category" : value} data`;
};

export default function DeleteData({ className = "" }) {
  const dialogRef = useRef(null);
  const [selectedValue, setSelectedValue] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const { categories } = useCategoryContext();
  const { user } = UserAuth();

  const closeDialog = () => dialogRef.current.close();

  const resetDialog = () => {
    setSelectedValue("");
    setError("");
  };

  const handleDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await deleteCategoryData(user.email, selectedValue);
      closeDialog();
    } catch (err) {
      console.error("Error deleting data: ", err);
      setError("Failed to delete data. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current.showModal()}
        className={className}
      >
        Delete data
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-data-title"
        onClose={resetDialog}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
        className="m-auto w-[min(92vw,24rem)] rounded-xl border border-white/10 bg-customBlack-500 p-0 text-white shadow-2xl backdrop:bg-black/70"
      >
        <div className="p-6">
          <h2
            id="delete-data-title"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50"
          >
            Delete data
          </h2>

          <label className="mt-5 block text-sm text-white/80">
            What should be deleted?
            <select
              value={selectedValue}
              onChange={(event) => setSelectedValue(event.target.value)}
              className="mt-2 w-full rounded border border-white/15 bg-customBlack-100 px-3 py-2 font-mono text-xs text-white outline-none transition-colors focus:border-white/40"
            >
              <option value="">Select data</option>
              <option value="All Data">All Data</option>
              {categories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="None">No Category</option>
            </select>
          </label>

          <p className="mt-4 min-h-10 text-sm leading-5 text-white/60">
            {selectedValue
              ? `This permanently deletes ${describeTarget(selectedValue)}. It can't be undone.`
              : "Choose what to remove."}
          </p>

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          <div className="mt-5 flex justify-end gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={closeDialog}
              className="rounded border border-white/15 px-3 py-2 text-white/70 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!selectedValue || deleting}
              className="rounded border border-red-500/70 px-3 py-2 text-red-400 transition-colors enabled:hover:bg-red-600 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? "Deleting" : "Delete"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

DeleteData.propTypes = {
  className: PropTypes.string,
};
