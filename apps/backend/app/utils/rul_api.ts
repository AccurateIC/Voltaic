import { RulInputData, RulPrediction } from "../utils/rul.js";

export async function getRulPrediction(inputData: RulInputData): Promise<RulPrediction | null> {
  const RUL_URL = process.env.RUL_URL;

  if (!inputData || Object.keys(inputData).length === 0) {
    console.warn(" Skipping RUL fetch: No input data provided.");
    return null;
  }

  try {
    const response = await fetch(`${RUL_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputData),
    });

    if (!response.ok) {
      console.warn(`RUL prediction failed with status: ${response.status}`);
      return null;
    }

    const result = await response.json();
    return result as RulPrediction;

  } catch (err) {
    console.error("❌ Error fetching RUL prediction:", err);
    return null;
  }
}




