import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export async function classifyFoodFreshness(imagePath) {
  try {
    // Read the image file and encode it as Base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    // Send the image to Roboflow for classification
    const response = await axios({
      method: "POST",
      url: `https://detect.roboflow.com/${process.env.ROBOFLOW_MODEL}/${process.env.ROBOFLOW_VERSION}`,
      params: {
        api_key: process.env.ROBOFLOW_API_KEY,
      },
      data: imageBase64,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Extract freshness classification from the response
    if (response.data.predictions.length > 0) {
      return response.data.predictions.reduce((prev, current) =>
        prev.confidence > current.confidence ? prev : current
      ).class;
    }

    return "Unknown"; // Default if no prediction is found
  } catch (error) {
    console.error("❌ Roboflow API Error:", error.message);
    return "Unknown";
  }
}
