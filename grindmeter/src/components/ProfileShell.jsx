import PropTypes from "prop-types";
import Squares from "../blocks/Backgrounds/Squares/Squares";

// Clears the grid behind the clock and lets it return toward the page edges
const CLOCK_CLEARING =
  "radial-gradient(ellipse max(32vw, 20rem) max(46vh, 22rem) at 50% 50%, #121212 45%, rgb(18 18 18 / 0.8) 68%, rgb(18 18 18 / 0) 100%)";

// One grid stays mounted across the intro and dashboard so it never restarts
export default function ProfileShell({ cleared, children }) {
  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-customBlack-500 px-4 py-20">
      <div className="absolute inset-0 opacity-50">
        <Squares
          direction="diagonal"
          speed={0.25}
          borderColor="#23a946"
          squareSize={60}
          hoverFillColor="#222"
        />
      </div>
      <div
        aria-hidden="true"
        style={{ backgroundImage: CLOCK_CLEARING }}
        className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${
          cleared ? "opacity-100" : "opacity-0"
        }`}
      />
      {children}
    </div>
  );
}

ProfileShell.propTypes = {
  cleared: PropTypes.bool.isRequired,
  children: PropTypes.node,
};
