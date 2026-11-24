import {
  arrayUnion,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import db from "../firebase-config";

const RESERVED_NAMES = ["none", "all data", "no category"];
const BATCH_LIMIT = 500;

// Returns a message when a name can't be used, or an empty string when it can
export function categoryNameError(name, categories, currentName = "") {
  const normalized = name.toLowerCase();
  if (!normalized) return "Enter a name";
  const taken =
    RESERVED_NAMES.includes(normalized) ||
    categories.some(
      (category) =>
        category.toLowerCase() === normalized &&
        category.toLowerCase() !== currentName.toLowerCase()
    );
  return taken ? "Category already exists" : "";
}

async function categoriesDocument(userEmail) {
  const snapshot = await getDocs(
    query(collection(db, "categories"), where("userEmail", "==", userEmail))
  );
  if (snapshot.empty) throw new Error("No categories found for this account");
  return snapshot.docs[0];
}

// Keeps session history attached when a category is renamed or removed
async function moveSessions(userEmail, fromCategory, toCategory) {
  const snapshot = await getDocs(
    query(
      collection(db, `timerData/${userEmail}/timerUse`),
      where("category", "==", fromCategory)
    )
  );
  for (let start = 0; start < snapshot.docs.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    snapshot.docs.slice(start, start + BATCH_LIMIT).forEach((session) => {
      batch.update(session.ref, { category: toCategory });
    });
    await batch.commit();
  }
}

export async function addCategory(userEmail, name) {
  const document = await categoriesDocument(userEmail);
  await updateDoc(document.ref, { categories: arrayUnion(name) });
}

export async function renameCategory(userEmail, currentName, newName) {
  const document = await categoriesDocument(userEmail);
  const saved = document.data().categories;
  if (!saved.includes(currentName)) throw new Error("Category not found");
  const categories = saved.map((name) =>
    name === currentName ? newName : name
  );
  await updateDoc(document.ref, { categories });
  await moveSessions(userEmail, currentName, newName);
  return categories;
}

export async function deleteCategory(userEmail, name) {
  const document = await categoriesDocument(userEmail);
  const saved = document.data().categories;
  if (!saved.includes(name)) throw new Error("Category not found");
  const categories = saved.filter((category) => category !== name);
  await updateDoc(document.ref, { categories });
  await moveSessions(userEmail, name, "None");
  return categories;
}
