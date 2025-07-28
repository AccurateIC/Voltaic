
export async function getRulPrediction(inputData: RulInputData): Promise<RulPrediction> {
  const RUL_URL = process.env.RUL_URL; 
  if (!RUL_URL) {
    console.error("RUL_URL environment variable is not defined.")
    throw new Error("Configuration error: RUL_URL is missing. Please ensure it's set in your environment.")
  }

  try
  {
   const response = await fetch(`${RUL_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputData),
  });
   if (!response.ok) {
      const errData = await response.json();
      console.error("RUL", errData);
      throw new Error("Failed to fetch RUL prediction");
    }
  const result = response.json(); 
  console.log("RUL Response", response);
  return result;
 }
 catch (error) {
    console.error("Error fetching RUL prediction:", error);
    throw new Error("Failed to fetch RUL prediction");
  }
}
