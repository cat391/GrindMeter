import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocsFromServer,
  query,
  setDoc,
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

// Only call once the server has confirmed this account has no category record
export async function createUserRecords(userEmail) {
  await addDoc(collection(db, "categories"), {
    userEmail,
    categories: ["None"],
  });
  await setDoc(doc(db, "timerData", userEmail), { userEmail }, { merge: true });
}

// These read from the server because an offline read can be empty or partial,
// which would make a rename or delete skip saved time.
async function categoriesDocument(userEmail) {
  const snapshot = await getDocsFromServer(
    query(collection(db, "categories"), where("userEmail", "==", userEmail))
  );
  if (snapshot.empty) throw new Error("No categories found for this account");
  return snapshot.docs[0];
}

// Moves session history first and saves the name list in the last batch, so a
// failure leaves the old category in place and the action can be retried.
async function moveSessionsAndSaveNames(
  userEmail,
  categoriesRef,
  categories,
  fromCategory,
  toCategory
) {
  const sessions = await getDocsFromServer(
    query(
      collection(db, `timerData/${userEmail}/timerUse`),
      where("category", "==", fromCategory)
    )
  );
  const updates = [
    ...sessions.docs.map((session) => [session.ref, { category: toCategory }]),
    [categoriesRef, { categories }],
  ];
  for (let start = 0; start < updates.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    updates
      .slice(start, start + BATCH_LIMIT)
      .forEach(([ref, data]) => batch.update(ref, data));
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
  await moveSessionsAndSaveNames(
    userEmail,
    document.ref,
    categories,
    currentName,
    newName
  );
}

export async function deleteCategory(userEmail, name) {
  const document = await categoriesDocument(userEmail);
  const saved = document.data().categories;
  if (!saved.includes(name)) throw new Error("Category not found");
  const categories = saved.filter((category) => category !== name);
  await moveSessionsAndSaveNames(
    userEmail,
    document.ref,
    categories,
    name,
    "None"
  );
}
