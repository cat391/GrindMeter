import { useState, useEffect, useRef } from "react";
import Timer from "../components/Timer";
import PresetButton from "../components/PresetButton";
import "../App.css";
import { BiPause, BiReset, BiPlay } from "react-icons/bi";
import { usePresetContext } from "../context/PresetContext";
import CategoryComponent from "../components/CategoryComponent";
import { useAmbienceContext } from "../context/PresetContext";
import { useCategoryContext } from "../context/CategoryContext";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../transition.css";
import { UserAuth } from "../context/AuthContext";

export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const { presets } = usePresetContext();
  const [displayedTime, setDisplayedTime] = useState(0);
  const [shouldReset, setShouldReset] = useState(0);
  const oldPresets = useRef(presets);
  const { visualAmbience, setTimerRunning } = useAmbienceContext();
  const { currentCategory } = useCategoryContext();
  const { user } = UserAuth();
  // Stuff for CSS Transition
  const key = isOn && visualAmbience ? "AMB" : "CAT";
  const content1 =
    isOn && visualAmbience && user ? (
      <div className="text-white font-bold">{currentCategory}</div>
    ) : (
      <div className="">
        <CategoryComponent />
      </div>
    );
  const content2 =
    isOn && visualAmbience ? (
      <div>
        <div className="flex space-x-4 justify-center items-center h-50"></div>
      </div>
    ) : (
      <div className="flex space-x-4 justify-center items-center h-50">
        {[0, 1, 2].map((id) => {
          return (
            <PresetButton
              presets={presets}
              key={id}
              id={id}
              onClick={() => handleTimerChange(id)}
            />
          );
        })}
      </div>
    );

  const handleTimerChange = (id) => {
    setDisplayedTime(id);
    setIsOn(false);
  };

  const toggleTimer = () => setIsOn((prev) => (prev ? false : true));

  const resetTimer = () => {
    setShouldReset((prev) => prev + 1);
    setIsOn(false);
  };

  useEffect(() => {
    let shouldResetTimer = false;
    presets.forEach((element, index) => {
      // Finds the index of the preset that changed, and compares that index to the current preset being used
      if (element !== oldPresets.current[index] && index === displayedTime) {
        shouldResetTimer = true; // Must reset displayed timer, as it was changed
      }
    });

    if (shouldResetTimer) {
      resetTimer();
    }
    oldPresets.current = presets;
  }, [presets]); // Causes error if you change another preset than the one you are on

  // Change background is visual ambience is turned on
  useEffect(() => {
    // Update ambience context to see if timer is running
    setTimerRunning(isOn);
    if (visualAmbience && isOn) {
      const cls = "bg-customBlack-500";
      document.body.classList.add(cls);
      return () => document.body.classList.remove(cls);
    } else {
      const cls = "bg-customBlack-100";
      document.body.classList.add(cls);
      return () => document.body.classList.remove(cls);
    }
  }, [visualAmbience, isOn]);

  return (
    <div>
      <h2>
        <Timer
          durationID={displayedTime}
          isRunning={isOn}
          reset={shouldReset}
        />
      </h2>

      <div className="relative m-7 h-16">
        <TransitionGroup component={null}>
          <CSSTransition
            key={key}
            timeout={2000}
            classNames="fade"
            mountOnEnter
            unmountOnExit
          >
            <div className="absolute inset-0 flex justify-center items-center">
              {content1}
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>

      <div>
        <TransitionGroup component={null}>
          <CSSTransition
            key={key}
            timeout={2000}
            classNames="preset-collapse"
            mountOnEnter
            unmountOnExit
          >
            <div className="flex justify-center items-center">{content2}</div>
          </CSSTransition>
        </TransitionGroup>
      </div>

      <div className="flex space-x-4 justify-center items-center h-40">
        <button
          className={`cursor-pointer transition-all bg-customGreen-100 text-white px-6 py-2 rounded-lg
    border-customGreen-200
    border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
    active:border-b-[2px] active:brightness-90 active:translate-y-[2px] ${
      isOn && visualAmbience ? "text-2xl" : "text-3xl"
    }`}
          onClick={toggleTimer}
        >
          {isOn ? <BiPause /> : <BiPlay />}
        </button>
        <button
          className={`cursor-pointer transition-all bg-customGreen-100 text-white px-6 py-2 rounded-lg
    border-customGreen-200
    border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
    active:border-b-[2px] active:brightness-90 active:translate-y-[2px]  ${
      isOn && visualAmbience ? "text-2xl" : "text-3xl"
    }`}
          onClick={resetTimer}
        >
          <BiReset />
        </button>
      </div>
    </div>
  );
}
