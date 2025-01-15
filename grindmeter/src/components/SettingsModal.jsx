import { IoSettingsOutline } from "react-icons/io5";

function SettingsModal({ open, onClose, children }) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 flex justify-center items-center transition-colors ${
        open ? "visible bg-black/40" : "invisible"
      }`}
    >
      <div className="bg-customBlack-100 p-48 rounded-xl border-2 border-customGreen-300 flex flex-col items-center ">
        <div className="text-customGreen-100 mb-10">
          <IoSettingsOutline size={25} />
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
