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
import LineGraph from "../components/LineGraph";
import PieGraph from "../components/PieGraph";
import DeleteData from "../components/DeleteData";
import DownloadComponent from "../components/DownloadComponent";
import ProfileIntro from "../components/ProfileIntro";
import ProfileShell from "../components/ProfileShell";

export default function Login() {
  const { googleSignIn, user, logOut, authReady } = UserAuth();
  // Keeps the intro mounted through sign-in so it can animate out
  const [introHeld, setIntroHeld] = useState(false);
  // Stuff for custom time range
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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
    const cls = "bg-customBlack-100";
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

  // Handler for chart time dropdown
  const [selectedValue, setSelectedValue] = useState("Month");

  const handleDropdownChange = (e) => {
    console.log(e.target.value === "Custom");
    console.log(!startDate || !endDate);
    console.log(startDate);
    console.log(endDate);
    if (e.target.value === "Custom" && (!startDate || !endDate)) return; // Validation if set to custom range
    setSelectedValue(e.target.value);
  };

  const handleDateChange = (e) => {
    e.target.name === "startDate"
      ? setStartDate(e.target.value)
      : setEndDate(e.target.value);
  };

  if (!authReady) {
    return <ProfileShell quiet />;
  }

  if (!user || introHeld) {
    return (
      <ProfileShell quiet={!user}>
        <ProfileIntro
          onSignIn={handleGoogleSignIn}
          onExited={() => setIntroHeld(false)}
        />
      </ProfileShell>
    );
  }

  return (
    <ProfileShell quiet={false}>
      <div className="relative z-10 w-full max-w-[1200px] h-auto bg-customBlack-100 text-white rounded-2xl p-8 shadow-xl flex flex-col items-center">
        <div className="mt-24 flex flex-col items-center">
          <div className="absolute top-8 left-8 flex items-center gap-8">
            <div>
              <h1 className="text-customGreen-100 text-3xl mb-4">
                {user.displayName}&apos;s Profile
              </h1>
              <button
                onClick={handleSignOut}
                className="px-6 py-2 border rounded-lg border-customGreen-300 text-customGreen-200 transition duration-300 ease-in-out transform hover:text-customGreen-100 hover:bg-customGreen-300/10"
              >
                Log out
              </button>
            </div>
            <div>
              <DeleteData />
            </div>
            <div>
              <DownloadComponent />
            </div>
            <div>
              <div className="bg-customBlack-200 p-6 rounded-lg text-black flex flex-col justify-between h-auto space-y-4">
                <label className="text-white font-medium">
                  Custom Time Range
                </label>
                <div className="flex items-center justify-center space-x-2">
                  <input
                    name="startDate"
                    type="date"
                    onChange={handleDateChange}
                    className="text-sm p-1 hover:cursor-pointer"
                  />

                  <input
                    name="endDate"
                    type="date"
                    onChange={handleDateChange}
                    className="text-sm p-1 hover:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-8 right-8 text-black">
            <select
              value={selectedValue}
              onChange={handleDropdownChange}
              className="bg-customBlack-300 px-3 py-1 outline-none w-24 text-xs text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#7d808a] border-[#717171] pr-10 appearance-none"
            >
              <option>Week</option>
              <option>Month</option>
              <option>Year</option>
              <option>Custom</option>
            </select>
          </div>

          <div className="py-8 text-lg">
            <div className="relative z-10 w-full max-w-[1200px] h-auto bg-customBlack-100 text-white rounded-2xl p-8 grid grid-rows-[auto_1fr]">
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="relative">
                  <LineGraph
                    userEmail={user.email}
                    timeLine={selectedValue}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
                <div className="relative">
                  <PieGraph
                    userEmail={user.email}
                    timeLine={selectedValue}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfileShell>
  );
}
