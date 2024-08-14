// src/api/openai.ts
import axios from "axios";

const API_URL = "https://api.openai.com/v1";
const API_KEY =
  "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";

if (!API_KEY) {
  throw new Error("OpenAI API key is not set");
}

const openaiApi = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");

  try {
    console.log("Sending transcription request to OpenAI...");
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
