import { UserAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
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
