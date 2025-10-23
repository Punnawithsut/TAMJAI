import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { InformationContext } from "./InformationContext";

// === Base URL (adjust for your Flask backend) ===
const baseUrl = "http://127.0.0.1:5500/";
axios.defaults.baseURL = baseUrl;

export const InformationProvider = ({ children }) => {
  const [temp, setTemp] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [lux, setLux] = useState(null);
  const [windowStatus, setWindowStatus] = useState(false);
  const [time, setTime] = useState(Date.now());
  const [message, setMessage] = useState("");
  const [weather, setWeather] = useState("Sunny");
  const [darkness, setDarkness] = useState(0);
  const [customData, setCustomData] = useState({ temp: null, humidity: null, lux: null });
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiWeather, setApiWeather] = useState({ location: null, temp: null, uv: null, windSpeed: null });
  const [dataHistory, setDataHistory] = useState([]);

  // === Fetch latest sensor data ===
  const getSensorData = async () => {
    try {
      const response = await axios.get("/getData");
      const data = response.data;

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      const sensor = data.object;
      setTemp(sensor.temp);
      setHumidity(sensor.humidity);
      setLux(sensor.lux);
      setTime(sensor.time);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // === Analyze comfort using AI (optional feature) ===
  const analyze = async () => {
    try {
      const payload = {
        temp: customData?.temp ?? temp,
        humidity: customData?.humidity ?? humidity,
        lux: customData?.lux ?? lux,
        time,
        prompt: customPrompt || "Give general room comfort advice.",
      };

      const response = await axios.post("/analyze", payload);
      const data = response.data;

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success("AI advice received!");
      setMessage(data.advice);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // === Send command to open/close window ===
  const handleWindowStatusChange = async (status) => {
    setWindowStatus(status);
    try {
      // This sends "open" or "close" to Arduino via Flask backend
      await axios.post("/setWindowStatus", {
        topic: "comfortzone/command",
        message: status ? "open" : "close",
      });
      toast.success(`🪟 Window turned ${status ? "OPEN" : "CLOSED"}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // === Get window status from backend ===
  const getWindowStatus = async () => {
    try {
      const response = await axios.get("/getWindowStatus");
      const data = response.data;

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      setWindowStatus(data.status);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // === Get browser location ===
  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation not supported by your browser");
        return reject("Geolocation not supported");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          toast.error("Unable to retrieve your location");
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  // === Get weather info ===
  const getWeather = async () => {
    try {
      const { latitude, longitude } = await getLocation();
      const response = await axios.post("/getWeather", {
        location: `${latitude},${longitude}`,
      });

      const data = response.data;
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      setApiWeather(data.object);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // === Send Darkness Value ===
  const handleDarknessChange = async (value) => {
    setDarkness(value);
    try {
      // Send JSON {darkness: value} to MQTT via backend
      await axios.post("/setDarkness", {
        topic: "comfortzone/command",
        message: JSON.stringify({ darkness: value }),
      });
      toast.success(`🌑 Darkness set to ${value}%`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // === Values exposed to context ===
  const value = {
    temp,
    humidity,
    lux,
    windowStatus,
    time,
    message,
    weather,
    darkness,
    customData,
    customPrompt,
    isLoading,
    apiWeather,
    dataHistory,
    setTemp,
    setHumidity,
    setLux,
    setWindowStatus,
    setTime,
    setMessage,
    setWeather,
    setDarkness,
    setCustomData,
    setCustomPrompt,
    setIsLoading,
    setApiWeather,
    setDataHistory,
    getSensorData,
    getWindowStatus,
    analyze,
    handleWindowStatusChange,
    handleDarknessChange,
    getWeather,
  };

  return <InformationContext.Provider value={value}>{children}</InformationContext.Provider>;
};
