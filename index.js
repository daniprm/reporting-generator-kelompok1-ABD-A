import inquirer from "inquirer";
import { authenticateUser } from "./auth.js";
import { exportSalesReportToExcel } from "./exportExcel.js";
// import { generateSalesReport } from "./reports.js";

async function main() {
  const { username, password } = await inquirer.prompt([
    { type: "input", name: "username", message: "Username:" },
    { type: "password", name: "password", message: "Password:" },
  ]);

  try {
    const token = await authenticateUser(username, password);
    console.log("Authenticated successfully");

    console.log("Generating and exporting the sales report...");
    // await generateSalesReport(); // Output will be displayed in terminal
    await exportSalesReportToExcel();
    console.log("Report has been exported successfully.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
