import { GoogleButton } from "react-google-button";
import { UserAuth } from "../context/AuthContext";
import TestImage from "../components/TestImage";
import { useEffect, useState } from "react";
import db from "../firebase-config";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

export default function Login() {
  const { googleSignIn, user, logOut } = UserAuth();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  // Check if user has entered the firestore database by checking each email in the categories firestore
  const checkForUserEmail = async (userEmail) => {
    try {
      const q = query(
        collection(db, "categories"),
        where("userEmail", "==", userEmail)
      );
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.log("Error fetching documents: ", error);
      return false;
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

  useEffect(() => {
    // Check if user has their databases created
    const initializeUserData = async () => {
      if (user && user.email) {
        const userExists = await checkForUserEmail(user.email);
        if (!userExists) {
          await createCategoriesForUse(user.email);
          console.log("Create categories for ", user.email);
        }
      }
    };

    initializeUserData();
  }, [user]);

  return (
    <div>
      <div className="flex justify-center text-3xl py-20">
        {user && (
          <>
            <h1 className="text-customGreen-100">{user.displayName}'s Data</h1>
          </>
        )}
      </div>
      <div className="flex justify-center items-center py-8 font-size-10 text-lg text-customGreen-100">
        {user?.displayName ? (
          <button onClick={handleSignOut}>Log out</button>
        ) : (
          <button onClick={handleGoogleSignIn}>Sign in with Google</button>
        )}
      </div>
    </div>
  );
}
