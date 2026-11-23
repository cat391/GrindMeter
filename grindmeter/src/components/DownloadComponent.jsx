import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import PropTypes from "prop-types";
import db from "../firebase-config";
import { UserAuth } from "../context/AuthContext";

export default function DownloadComponent({ className = "" }) {
  const { user } = UserAuth();
  const [failed, setFailed] = useState(false);

  const handleDownload = async () => {
    if (!user) return; // Exit if no user is found
    setFailed(false);

    try {
      // Convert user's data to JSON format
      const timerUseRef = collection(db, `timerData/${user.email}/timerUse`);
      const querySnapshot = await getDocs(timerUseRef);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${user.displayName}_data.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading data: ", error);
      setFailed(true);
    }
  };

  return (
    <button type="button" onClick={handleDownload} className={className}>
      {failed ? "Export failed, retry" : "Export JSON"}
    </button>
  );
}

DownloadComponent.propTypes = {
  className: PropTypes.string,
};
