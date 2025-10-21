import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { InformationContext } from "./InformationContext";

const baseUrl = "http://127.0.0.1:5000/";
axios.defaults.baseURL = baseUrl;

export const InformationProvider = ({ children }) => {
  const [temp, setTemp] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [lux, setLux] = useState(null);
  const [windowStatus, setWindowStatusState] = useState(false);

  const [time, setTime] = useState(Date.now());
  const [message, setMessage] = useState("");
  const [weather, setWeather] = useState("Sunny");
  const [darkness, setDarkness] = useState(0);
  const [customData, setCustomData] = useState({"temp": null, "humidity": null, "lux": null});
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      //console.log(`Get sensor data at ${time}`);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const analyze = async () => {
    try {
      const payload = {
        temp: customData?.temp ?? temp,
        humidity: customData?.humidity ?? humidity,
        lux: customData?.lux ?? lux,
        time,
        prompt: customPrompt || "Give general room comfort advice."
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

  const handleWindowStatusChange = async (status) => {
    setWindowStatusState(status); // update local state immediately
    try {
      await axios.post("/setWindowStatus", { status }); // call your server endpoint
      toast.success(`Window turned ${status ? "ON" : "OFF"}`);
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
    getSensorData,
    analyze,
    handleWindowStatusChange,
  };

  return (
    <InformationContext.Provider value={value}>
      {children}
    </InformationContext.Provider>
  );
};
