import { UserAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import db from "../firebase-config";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import ProfileDashboard from "../components/ProfileDashboard";
import ProfileIntro from "../components/ProfileIntro";
import ProfileShell from "../components/ProfileShell";

export default function Login() {
  const { googleSignIn, user, logOut, authReady } = UserAuth();
  // Keeps the intro mounted through sign-in so it can animate out
  const [introHeld, setIntroHeld] = useState(false);

  const handleGoogleSignIn = async () => {
    setIntroHeld(true);
    try {
      await googleSignIn();
    } catch (error) {
      setIntroHeld(false);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  // Change background to make sure it is the right color
  useEffect(() => {
    const cls = "bg-customBlack-500";
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, []);

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

  const createCategoriesForUser = async (userEmail) => {
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

  const createTimerDataForUser = async (userEmail) => {
    try {
      const userRef = doc(db, "timerData", userEmail);

      await setDoc(userRef, {
        userEmail: userEmail,
      });

      console.log("Create timerData for ", userEmail);
    } catch (error) {
      console.log("Error creating document: ", error);
    }
  };

  useEffect(() => {
    // Check if user has their databases created
    const initializeUserData = async () => {
      if (user && user.email) {
        const userExists = await checkForUserEmail(user.email);
        if (!userExists) {
          await createCategoriesForUser(user.email);
          await createTimerDataForUser(user.email);
          console.log("Create categories for ", user.email);
        }
      }
    };

    initializeUserData();
  }, [user]);

  if (!authReady) {
    return <ProfileShell cleared />;
  }

  if (!user || introHeld) {
    return (
      <ProfileShell cleared={!user}>
        <ProfileIntro
          onSignIn={handleGoogleSignIn}
          onExited={() => setIntroHeld(false)}
        />
      </ProfileShell>
    );
  }

  return (
    <ProfileShell cleared={false}>
      <ProfileDashboard user={user} onSignOut={handleSignOut} />
    </ProfileShell>
  );
}
