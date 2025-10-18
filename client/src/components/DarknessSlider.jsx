import { useContext } from "react";
import { InformationContext } from "../contexts/InformationContext";

const DarknessSlider = () => {
  const { darkness, setDarkness } = useContext(InformationContext);

  const handleChange = (e) => {
    setDarkness(Number(e.target.value));
  };

  return (
    <div>
      <p className="mb-2 font-medium">
        Darkness: <span>{darkness}%</span>
      </p>

      <div className="relative w-full h-6 rounded-full bg-gray-300">
        {/* Filled part */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#1800ad]"
          style={{ width: `${darkness}%` }}
        ></div>

        {/* Invisible range input (for dragging) */}
        <input
          type="range"
          min="0"
          max="100"
          value={darkness}
          onChange={handleChange}
          className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer z-10"
        />

        {/* White knob */}
        <div
          className="absolute top-0 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow border"
          style={{ left: `calc(${darkness}% - 12px)`, top: "50%" }}
        ></div>
      </div>
    </div>
  );
};

export default DarknessSlider;