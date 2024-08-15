// src/api/openai.ts
import axios from "axios";

const API_URL = "https://api.openai.com/v1";
const API_KEY = "__OPENAI_API_KEY__";

if (API_KEY === "__OPENAI_API_KEY__" || API_KEY === "API_KEY_NOT_SET") {
  console.error("API key not set properly");
  throw new Error(
    "OpenAI API key is not set properly. Check your environment variables and build process.",
  );
}

console.log("API_KEY is set"); // For debugging

const openaiApi = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

export const transcribeAudio = async (
  audioBlob: Blob,
  mimeType: string,
): Promise<string> => {
  const formData = new FormData();
  const fileExtension = mimeType.split("/")[1];
  formData.append("file", audioBlob, `audio.${fileExtension}`);
  formData.append("model", "whisper-1");

  try {
    console.log(
      `Sending transcription request to OpenAI... (MIME type: ${mimeType})`,
    );
    const response = await openaiApi.post("/audio/transcriptions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Transcription response:", response.data);
    return response.data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        throw new Error(
          `OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      } else if (error.request) {
        throw new Error("No response received from OpenAI API");
      } else {
        throw new Error(`Error setting up request: ${error.message}`);
      }
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const transformText = async (
  text: string,
  transformation: string,
): Promise<string> => {
  try {
    const response = await openaiApi.post("/chat/completions", {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that ${transformation} the given text.`,
        },
        { role: "user", content: text },
      ],
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error transforming text:", error);
    throw new Error("Failed to transform text");
  }
};
