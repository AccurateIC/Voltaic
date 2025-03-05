import { healthIndexData } from "./healthIndexData.js";
import { writeFileSync } from "fs";

const main = () => {
  const filteredData = healthIndexData.filter((value, index, arr) => index % 4 == 0);
  console.log(healthIndexData.length);
  console.log(filteredData.length);
  writeFileSync("filteredHealthIndexData.json", JSON.stringify(filteredData, null, 2));
};

main();
