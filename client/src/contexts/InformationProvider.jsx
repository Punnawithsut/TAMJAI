import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast"
import { InformationContext } from "./InformationContext";

const baseUrl = "";
axios.defaults.baseURL = baseUrl;

export const InformationProvider = ({ children }) => {
    const value = {};

    return <InformationContext.Provider value={value}>
        {children}
    </InformationContext.Provider>
}
