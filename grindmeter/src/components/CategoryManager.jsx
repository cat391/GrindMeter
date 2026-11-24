import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiEdit2, FiLock, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import PropTypes from "prop-types";
import { UserAuth } from "../context/AuthContext";
import { useCategoryContext } from "../context/CategoryContext";
import {
  addCategory,
  categoryNameError,
  deleteCategory,
  renameCategory,
} from "../utils/categoryStore";
import { categoryColors } from "../utils/timerStats";

const NAME_INPUT =
  "min-w-0 flex-1 border-b border-white/20 bg-transparent py-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-customGreen-100";
const ICON_BUTTON =
  "grid h-8 w-8 shrink-0 place-items-center rounded text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

function CategoryRow({ name, color, categories, onRename, onDelete }) {
  const [mode, setMode] = useState("view");
  const [draft, setDraft] = useState(name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const showView = () => {
    setMode("view");
    setDraft(name);
    setError("");
  };

  const run = async (action, failure) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      console.error(failure, err);
      setError(failure);
      setBusy(false);
    }
  };

  const submitRename = (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (trimmed === name) {
      showView();
      return;
    }
    const nameError = categoryNameError(trimmed, categories, name);
    if (nameError) {
      setError(nameError);
      return;
    }
    run(() => onRename(name, trimmed), "Couldn't rename category");
  };

  return (
    <li className="border-b border-white/[0.07] py-1 last:border-b-0">
      {mode === "edit" ? (
        <form onSubmit={submitRename} className="flex items-center gap-1">
          <input
            autoFocus
            aria-label={`Rename ${name}`}
            value={draft}
            maxLength={60}
            disabled={busy}
            onChange={(event) => setDraft(event.target.value)}
            onFocus={(event) => event.target.select()}
            onKeyDown={(event) => {
              // Escape leaves the rename without closing Settings
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                showView();
              }
            }}
            className={`${NAME_INPUT} mr-2`}
          />
          <button type="submit" aria-label="Save name" disabled={busy} className={`${ICON_BUTTON} text-customGreen-100`}>
            <FiCheck />
          </button>
          <button type="button" aria-label="Cancel rename" disabled={busy} onClick={showView} className={ICON_BUTTON}>
            <FiX />
          </button>
        </form>
      ) : mode === "delete" ? (
        <div className="flex items-center justify-between gap-3 py-1">
          <p className="min-w-0 text-xs leading-4 text-white/70">
            Delete <span className="text-white">{name}</span>? Its time moves to
            No Category.
          </p>
          <div className="flex shrink-0 gap-1 text-xs">
            <button
              type="button"
              disabled={busy}
              onClick={showView}
              className="rounded px-2 py-1.5 text-white/60 transition-colors hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onDelete(name), "Couldn't delete category")}
              className="rounded border border-red-500/70 px-2 py-1 text-red-400 transition-colors enabled:hover:bg-red-600 enabled:hover:text-white disabled:opacity-40"
            >
              {busy ? "Deleting" : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <div className="group flex items-center gap-2.5">
          <span
            aria-hidden="true"
            style={{ backgroundColor: color }}
            className="h-2 w-2 shrink-0 rounded-full"
          />
          <span title={name} className="min-w-0 flex-1 truncate py-2 text-sm text-white">
            {name}
          </span>
          <button type="button" aria-label={`Rename ${name}`} onClick={() => setMode("edit")} className={ICON_BUTTON}>
            <FiEdit2 size={14} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${name}`}
            onClick={() => setMode("delete")}
            className={`${ICON_BUTTON} hover:text-red-400`}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="pb-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </li>
  );
}

CategoryRow.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRename: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function CategoryManager({ onNavigate }) {
  const { user } = UserAuth();
  const { categories, currentCategory, setCurrentCategory } =
    useCategoryContext();
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <FiLock aria-hidden="true" className="text-white/40" size={20} />
        <p className="text-sm text-white/70">
          Sign in to organize your time by category.
        </p>
        <Link
          to="/profile"
          onClick={onNavigate}
          className="text-sm text-customGreen-100 transition-opacity hover:opacity-70"
        >
          Go to Profile
        </Link>
      </div>
    );
  }

  const names = categories.filter((name) => name !== "None");
  const colors = categoryColors([], categories);

  const handleAdd = async (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    const nameError = categoryNameError(trimmed, categories);
    if (nameError) {
      setError(nameError);
      return;
    }
    setAdding(true);
    setError("");
    try {
      await addCategory(user.email, trimmed);
      setDraft("");
    } catch (err) {
      console.error("Couldn't add category", err);
      setError("Couldn't add category");
    } finally {
      setAdding(false);
    }
  };

  const handleRename = async (currentName, newName) => {
    await renameCategory(user.email, currentName, newName);
    if (currentCategory === currentName) setCurrentCategory(newName);
  };

  const handleDelete = async (name) => {
    await deleteCategory(user.email, name);
    if (currentCategory === name) setCurrentCategory("None");
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          aria-label="New category"
          placeholder="New category"
          value={draft}
          maxLength={60}
          disabled={adding}
          autoComplete="off"
          onChange={(event) => {
            setDraft(event.target.value);
            setError("");
          }}
          className={NAME_INPUT}
        />
        <button
          type="submit"
          aria-label="Add category"
          disabled={adding || !draft.trim()}
          className={`${ICON_BUTTON} enabled:text-customGreen-100`}
        >
          <FiPlus size={18} />
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {names.length === 0 ? (
        <p className="mt-6 text-sm text-white/50">No categories yet.</p>
      ) : (
        <ul aria-label="Your categories" className="mt-3">
          {names.map((name) => (
            <CategoryRow
              key={name}
              name={name}
              color={colors.get(name)}
              categories={categories}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

CategoryManager.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
