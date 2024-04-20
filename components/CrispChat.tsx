"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("ae984792-71d3-4b72-aea7-7a14370a63c6");
    }, []);

    return null;
}