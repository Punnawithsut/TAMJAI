import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast"
import { InformationContext } from "./InformationContext";

const baseUrl = "http://127.0.0.1:5000";
axios.defaults.baseURL = baseUrl;

export const InformationProvider = ({ children }) => {
    const [temp, setTemp] = useState(null);
    const [humidity, setHumidity] = useState(null);
    const [lux, setLux] = useState(null);
    const [windowStatus, setWindowStatus] = useState(false);
    const [time, setTime] = useState(Date.now());

    const getSensorData = async () => {
        try {
            const response = await axios.get("getData");
            console.log(response);
            const data = response.data;
            if(!data.success) {
                toast.success(data.message);
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
        }
    }

    const value = {
        temp, 
        humidity,
        lux,
        windowStatus,
        time,
        setTemp,
        setHumidity,
        setLux,
        setWindowStatus,
        setTime,
        getSensorData,
    };

    return <InformationContext.Provider value={value}>
        {children}
    </InformationContext.Provider>
}
