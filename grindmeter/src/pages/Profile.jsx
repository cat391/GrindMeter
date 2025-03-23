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
import Squares from "../blocks/Backgrounds/Squares/Squares";
import BlurText from "../blocks/TextAnimations/BlurText/BlurText";
import { useSpring, animated } from "@react-spring/web";
import ShinyText from "../blocks/TextAnimations/ShinyText/ShinyText";

export default function Login() {
  const { googleSignIn, user, logOut } = UserAuth();
  const [blurAnimationComplete, setBlurAnimationComplete] = useState(false);
  const [hovered, setHovered] = useState(false);
  const loginSpring = useSpring({
    opacity: blurAnimationComplete ? 1 : 0,
    transform: blurAnimationComplete ? "translateY(0)" : "translateY(10px)",
    config: { tension: 120, friction: 14 },
  });

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

  // Handlers for sign in page

  const handleBlurAnimationComplete = () => {
    setTimeout(() => {
      setBlurAnimationComplete(true);
      console.log("complete");
    }, 250);
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

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <Squares
          direction="diagonal"
          speed={0.25}
          borderColor="#23a946"
          squareSize={60}
          hoverFillColor="#222"
        />
      </div>
      <div className="relative z-10 w-[1200px] h-[600px] bg-customBlack-100 text-white rounded-2xl p-8 shadow-xl flex flex-col items-center">
        <div className="absolute top-32 left-0 w-full flex justify-center">
          <BlurText
            text="Start your grind."
            delay={100}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleBlurAnimationComplete}
            className="text-6xl"
            highlightWord="grind."
            highlightClassName="text-customGreen-100"
          />
        </div>
        <div className="mt-24 flex flex-col items-center">
          <div className="text-3xl py-8">
            {user && (
              <h1 className="text-customGreen-100">
                {user.displayName}'s Data
              </h1>
            )}
          </div>
          <div className="py-8 text-lg">
            {user?.displayName ? (
              <button
                onClick={handleSignOut}
                className="px-6 py-2 border border-white rounded-lg hover:bg-gray-800 transition-colors text-customGreen-100"
              >
                Log out
              </button>
            ) : (
              <div>
                <div></div>
                {blurAnimationComplete && (
                  <animated.div
                    style={loginSpring}
                    className="flex flex-col items-center"
                  >
                    <button
                      className="text-customGreen-100 m-20 text-3xl p-7"
                      onClick={handleGoogleSignIn}
                      onMouseEnter={() => setHovered(true)}
                      onMouseLeave={() => setHovered(false)}
                    >
                      {hovered ? (
                        <ShinyText
                          text="Login with Google"
                          disabled={false}
                          speed={0.5}
                          color="text-customGreen-300"
                        />
                      ) : (
                        <ShinyText
                          text="Login with Google"
                          disabled={false}
                          speed={3}
                          className="custom-class"
                        />
                      )}
                    </button>
                  </animated.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
