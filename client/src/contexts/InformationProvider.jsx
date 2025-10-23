\import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { InformationContext } from "./InformationContext";

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

  // Fetch latest sensor data from server
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
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  // Analyze sensor data using AI
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
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  // Update window status
  const handleWindowStatusChange = async (status) => {
    setWindowStatus(status);
    try {
      await axios.post("/setWindowStatus", { status });
      toast.success(`Window turned ${status ? "ON" : "OFF"}`);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  // Get user's location using browser Geolocation
  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
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

  // Get weather data from server
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
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  // Fetch current window status
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
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

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
    getWeather,
  };

  return <InformationContext.Provider value={value}>{children}</InformationContext.Provider>;
};
