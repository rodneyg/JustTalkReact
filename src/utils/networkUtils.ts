// src/utils/networkUtils.ts

export const getNetworkType = (): "wifi" | "cellular" | "unknown" => {
  if ("connection" in navigator && "type" in navigator.connection) {
    if (navigator.connection.type === "wifi") {
      return "wifi";
    } else if (navigator.connection.type === "cellular") {
      return "cellular";
    }
  }
  return "unknown";
};

export const getChunkDuration = (
  networkType: "wifi" | "cellular" | "unknown",
): number => {
  switch (networkType) {
    case "wifi":
      return 30; // 30 seconds for Wi-Fi
    case "cellular":
      return 15; // 15 seconds for cellular
    default:
      return 20; // 20 seconds for unknown
  }
};
