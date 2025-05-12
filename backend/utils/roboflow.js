import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export async function classifyFoodFreshness(imagePath) {
  try {
 
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

   
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

 
    if (response.data.predictions.length > 0) {
      return response.data.predictions.reduce((prev, current) =>
        prev.confidence > current.confidence ? prev : current
      ).class;
    }

    return "Unknown";
  } catch (error) {
    console.error("❌ Roboflow API Error:", error.message);
    return "Unknown";
  }
}
