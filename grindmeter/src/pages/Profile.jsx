import { GoogleButton } from "react-google-button";
import { UserAuth } from "../context/AuthContext";
import TestImage from "../components/TestImage";

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
