// src/api/openai.ts
import axios from "axios";

const API_URL = "https://api.openai.com/v1";
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.error("OpenAI API key is not set");
  throw new Error("OpenAI API key is not set");
}

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
  signal: AbortSignal,
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
      signal, // Add the AbortSignal here
    });
    console.log("Transcription response:", response.data);
    return response.data.text;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Transcription request was cancelled");
      throw new Error("Transcription cancelled");
    }
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
