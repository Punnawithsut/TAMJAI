import { useContext, useEffect } from "react";
import { InformationContext } from "../contexts/InformationContext";
import DarknessSlider from "../components/DarknessSlider";
import Scale from "../components/Scale";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const Dashboard = () => {
  const {
    time,
    temp,
    humidity,
    lux,
    windowStatus,
    setWindowStatus,
    getSensorData,
    getWeather,
    apiWeather,
    dataHistory,
    setDataHistory,
  } = useContext(InformationContext);

  const tempEmojis = ["🥶", "🤧", "😊", "🥵", "🔥"];
  const luxEmojis = ["☁️", "⛅", "☀️"];

  useEffect(() => {
    const fetchData = async () => {
      await getSensorData();
      //await getWeather();

      setDataHistory((prev) => {
        const newData = [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            temperature: temp,
            humidity,
            lux,
          },
        ];
        return newData.slice(-15);
      });
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [time, temp, humidity, lux]);

  useEffect(() => {
    getSensorData();
    getWeather();
    const interval = setInterval(() => {
      getSensorData();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

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
              <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
              {item.title === "Temperature" && (
                <p className="text-6xl mb-4 mt-4">
                  {temp < 5
                    ? tempEmojis[0]
                    : temp < 10
                    ? tempEmojis[1]
                    : temp < 20
                    ? tempEmojis[2]
                    : temp < 30
                    ? tempEmojis[3]
                    : tempEmojis[4]}
                </p>
              )}
              {item.title === "Humidity" && <Scale value={humidity} />}
              {item.title === "Light Intensity" && (
                <p className="text-6xl mb-4 mt-4">
                  {lux < 250
                    ? luxEmojis[0]
                    : lux < 750
                    ? luxEmojis[1]
                    : luxEmojis[2]}
                </p>
              )}
              <p className="text-xl font-bold text-gray-700">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Graph Column */}
        <div className="flex flex-col gap-4">
          {/* Temperature Graph */}
          <div className="bg-white shadow rounded-2xl p-4 h-[120px]">
            <h4 className="font-semibold text-gray-700 mb-2">Temperature Trend</h4>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={dataHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="temperature" stroke="#f87171" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Humidity Graph */}
          <div className="bg-white shadow rounded-2xl p-4 h-[120px]">
            <h4 className="font-semibold text-gray-700 mb-2">Humidity Trend</h4>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={dataHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="humidity" stroke="#60a5fa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Light Intensity Graph */}
          <div className="bg-white shadow rounded-2xl p-4 h-[120px]">
            <h4 className="font-semibold text-gray-700 mb-2">Light Intensity Trend</h4>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={dataHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="lux" stroke="#facc15" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Control Panel & Today Weather */}
      <div className="grid grid-cols-4 gap-6 w-full max-w-6xl">
        {/* Control Panel */}
        <div className="col-span-2 bg-white shadow rounded-2xl p-6 border-2 border-[#6c4de6]">
          <h3 className="font-bold text-lg mb-4 text-center">Control Panel</h3>

          <div className="flex flex-col gap-6">
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
          <p className={apiWeather.location ? "text-lg font-semibold text-gray-700" : "text-gray-500"}>
            Current Location: {apiWeather.location ?? "...."}
          </p>
          <p className={apiWeather.temp != null ? "text-lg font-semibold text-gray-700" : "text-gray-500"}>
            Felt Temperature: {apiWeather.temp ?? "...."} °C
          </p>
          <p className={apiWeather.uv != null ? "text-lg font-semibold text-gray-700" : "text-gray-500"}>
            UV index: {apiWeather.uv ?? "...."}
            {apiWeather.uv <= 2
              ? " (LOW)"
              : apiWeather.uv <= 5
              ? " (MODERATE)"
              : apiWeather.uv <= 7
              ? " (HIGH)"
              : apiWeather.uv <= 10
              ? " (VERY HIGH)"
              : " (EXTREME)"}
          </p>
          <p className={apiWeather.windSpeed != null ? "text-lg font-semibold text-gray-700" : "text-gray-500"}>
            Wind Speed: {apiWeather.windSpeed ?? "...."} kph
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
