import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast"
import { InformationContext } from "./InformationContext";

const baseUrl = "https://comfortzone-backend.onrender.com";
axios.defaults.baseURL = baseUrl;

export const InformationProvider = ({ children }) => {
    const [temp, setTemp] = useState(null);
    const [humidity, setHumidity] = useState(null);
    const [lux, setLux] = useState(null);
    const [windowStatus, setWindowStatus] = useState(false);
    const [time, setTime] = useState(Date.now());
    const [message, setMessage] = useState("");

    const getSensorData = async () => {
        try {
            const response = await axios.get("/getData");
            //console.log(response);
            const data = response.data;
            if(!data.success) {
                toast.error(data.message);
                return;
            }
            setTemp(data.temp);
            setHumidity(data.humidity);
            setLux(data.lux);
            setTime(data.time);

            console.log(`Get sensor data at ${time}`);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
        }
    }

    const analyze = async () => {
        try {
            const objects = {
                "temp": temp,
                "humidity": humidity,
                "lux": lux, 
                "time": time,
            }
            const response = await axios.post("/analyze", objects);
            //console.log(response);
            const data = response.data;
            if(!data.success) {
                toast.error(data.message);
                return
            }
            toast.success(data.message);
            console.log(data.advice)
            setMessage(data.advice);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
        }
    }

    //const addData = async () => {
    //    try {
    //        const objects = {
    //            "temp": temp,
    //            "humidity": humidity,
    //            "lux": lux, 
    //        }
    //        const response = await axios.post("/addData", objects);
    //        const data = response.data;
    //        if(!data.success) {
    //            toast.error(data.message);
    //            return
    //        }
    //        toast.success(data.message);
    //    } catch (error) {
    //        const message = error.response?.data?.message || error.message;
    //        toast.error(message);
    //    }
    //}
//
    const value = {
        temp, 
        humidity,
        lux,
        windowStatus,
        time,
        message,
        setTemp,
        setHumidity,
        setLux,
        setWindowStatus,
        setTime,
        setMessage,
        getSensorData,
        analyze,
    };

    return <InformationContext.Provider value={value}>
        {children}
    </InformationContext.Provider>
}
