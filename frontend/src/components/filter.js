import { healthIndexData } from "./healthIndexData.js";
import { writeFileSync } from "fs";

const main = () => {
  const filteredData = healthIndexData.filter((value, index, arr) => index % 100 == 0);
  console.log(healthIndexData.length);
  console.log(filteredData.length);
  writeFileSync("filteredHealthIndexData.js", JSON.stringify(filteredData, null, 2));
};

main();
