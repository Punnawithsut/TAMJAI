import { useContext, useEffect } from "react";
import { InformationContext } from "../contexts/InformationContext";
import DarknessSlider from "../components/DarknessSlider";

const Dashboard = () => {
  const { temp, humidity, lux, windowStatus, setWindowStatus, getSensorData } = useContext(InformationContext);

  useEffect(() => {
    getSensorData();
    const interval = setInterval(() => {
      getSensorData()
    }, 20000);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className="w-full min-h-screen bg-[#f1f1f1] flex flex-col items-center p-6">
      {/* Top Row: Temperature, Humidity, Light Intensity */}
      <div className="grid grid-cols-4 gap-6 w-full max-w-6xl mb-6">
        <div className="col-span-3 grid grid-cols-3 gap-6">
          {[
            { title: "Temperature", value: `${temp ?? "-100"}°C` },
            { title: "Humidity", value: `${humidity ?? "-100"}%` },
            { title: "Light Intensity", value: `${lux ?? "-100"} lux` },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white shadow rounded-2xl p-4 flex flex-col items-center justify-center"
            >
              <img
                src="https://em-content.zobj.net/source/microsoft-teams/363/face-with-monocle_1f9d0.png"
                alt="emoji"
                className="w-14 h-14 mb-2"
              />
              <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
              <p className="text-xl font-bold text-gray-700">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Graph Column */}
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((chart) => (
            <div
              key={chart}
              className="bg-white shadow rounded-2xl p-4 h-[120px] flex items-center justify-center"
            >
              <p className="text-gray-500">Chart {chart}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Control Panel & Today Weather */}
      <div className="grid grid-cols-4 gap-6 w-full max-w-6xl">
        {/* Control Panel */}
        <div className="col-span-2 bg-white shadow rounded-2xl p-6 border-2 border-[#6c4de6]">
          <h3 className="font-bold text-lg mb-4 text-center">Control Panel</h3>

          <div className="flex flex-col gap-6">
            {/* Darkness Slider */}
            <DarknessSlider />

            {/* Window Status */}
            <div>
              <p className="mb-2 font-medium">Window Status</p>
              <div
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  windowStatus ? "bg-[#1800ad]" : "bg-gray-300"
                }`}
                onClick={() => setWindowStatus(!windowStatus)}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow transform transition-transform duration-300 ${
                    windowStatus ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Today Weather */}
        <div className="col-span-2 bg-white shadow rounded-2xl p-6 flex flex-col items-center justify-center">
          <h3 className="font-bold text-lg mb-3">Today Weather</h3>
          <img
            src="https://em-content.zobj.net/source/microsoft-teams/363/cloud-with-snow_1f328-fe0f.png"
            alt="weather"
            className="w-16 h-16 mb-2"
          />
          <p className="text-lg font-semibold text-gray-700">Snow</p>
          <p className="text-gray-500">...</p>
          <p className="text-gray-500">...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
