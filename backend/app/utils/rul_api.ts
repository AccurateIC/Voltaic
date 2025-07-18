export async function getRulPrediction(inputData: RulInputData): Promise<RulPrediction> {
  const RUL_URL = process.env.RUL_URL; // make sure your .env file defines RUL_URL
  const response = await fetch(`${RUL_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputData),
  });

  const result = response.json(); 
  return result;
}
