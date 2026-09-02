"use client";

import { useEffect } from "react";
import { registerDecisionDeskTools } from "@/lib/webmcp/register-browser-tools";

export default function WebMCPRegistrar() {
  useEffect(() => {
    const unregister = registerDecisionDeskTools();

    return () => {
      unregister();
    };
  }, []);

  return null;
}
