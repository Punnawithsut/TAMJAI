import { useContext, useState, useEffect } from "react";
import { InformationContext } from "../contexts/InformationContext";
import { motion } from "framer-motion";

const Ai = () => {
  const {
    temp,
    humidity,
    lux,
    customData,
    setCustomData,
    customPrompt,
    setCustomPrompt,
    analyze,
    message,
    setMessage,
    isLoading,
    setIsLoading,
  } = useContext(InformationContext);

  const [useCustom, setUseCustom] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    // console.log(message);
    let index = 0;
    setTypedMessage(message[0]);
    const interval = setInterval(() => {
      if (index < message.length - 1) {
        setTypedMessage((prev) => prev + message[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [message]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setMessage("");
    await analyze();
    setIsLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          AI Comfort Advisor 🤖
        </h1>

        {/* Use Current Data or Custom */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setUseCustom(false)}
            className={`px-4 py-2 rounded-xl border ${
              !useCustom
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Use Current Data
          </button>
          <button
            onClick={() => setUseCustom(true)}
            className={`px-4 py-2 rounded-xl border ${
              useCustom
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Use Custom Data
          </button>
        </div>

        {/* Input Fields */}
        {useCustom ? (
          <div className="space-y-3 mb-6">
            <input
              type="number"
              placeholder="Temperature (°C)"
              value={customData.temp ?? ""}
              onChange={(e) =>
                setCustomData({ ...customData, temp: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Humidity (%)"
              value={customData.humidity ?? ""}
              onChange={(e) =>
                setCustomData({ ...customData, humidity: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Light level (lux)"
              value={customData.lux ?? ""}
              onChange={(e) =>
                setCustomData({ ...customData, lux: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />
          </div>
        ) : (
          <div className="text-sm text-gray-700 mb-6 space-y-1">
            <p>🌡️ Temperature: {temp ?? "—"}°C</p>
            <p>💧 Humidity: {humidity ?? "—"}%</p>
            <p>💡 Light: {lux ?? "—"} lux</p>
          </div>
        )}

        {/* Prompt Selector */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">
            Choose your prompt:
          </label>
          <select
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full p-2 border rounded-lg mb-3"
          >
            <option value="">Give general room comfort advice.</option>
            <option value="How can I make this room cooler?">
              How can I make this room cooler?
            </option>
            <option value="What should I do to make my room cozier?">
              What should I do to make my room cozier?
            </option>
            <option value="Suggest energy-saving adjustments.">
              Suggest energy-saving adjustments.
            </option>
            <option value="other">Other (custom input below)</option>
          </select>

          {customPrompt === "other" && (
            <input
              type="text"
              placeholder="Enter your custom question..."
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          )}
        </div>

        {/* Send Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`px-6 py-2 rounded-xl font-semibold text-white ${
              isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Thinking..." : "Get AI Advice"}
          </button>
        </div>

        {/* AI Response */}
        {typedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-gray-50 p-4 rounded-xl border text-gray-800"
          >
            <h3 className="font-semibold mb-2">💬 AI Suggestion:</h3>
            <p className="whitespace-pre-line leading-relaxed">
              {typedMessage}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Ai;
