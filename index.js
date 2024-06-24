import inquirer from "inquirer";
import { authenticateUser } from "./auth.js";
import { exportSalesReportToExcel } from "./exportExcel.js";
import { generateSalesReport } from "./reports.js";
import { getTableSchema, getTableNames, getColumns } from "./getTables.js";

async function main() {
  const { username, password } = await inquirer.prompt([
    { type: "input", name: "username", message: "Username:" },
    { type: "password", name: "password", message: "Password:" },
  ]);

  try {
    const token = await authenticateUser(username, password);
    console.log("Authenticated successfully");

    const mainQuestions = [
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["Generate Report", "Export Data", "Exit"],
      },
    ];

    const mainAnswers = await inquirer.prompt(mainQuestions);
    console.log("You selected:", mainAnswers.action);

    // Handle the selection
    switch (mainAnswers.action) {
      case "Generate Report":
        selectTableSchema();
        // console.log("Generating report...");
        // await generateSalesReport(); // Output will be displayed in terminal
        // await exportSalesReportToExcel();
        // console.log("Report has been exported successfully.");

        break;
      case "Export Data":
        console.log("Exporting data...");
        // Function to export data
        break;
      case "Exit":
        console.log("Exiting application...");
        process.exit(); // Exits the application
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function selectTableSchema() {
  const selectTableSchemaQuestions = [
    {
      type: "list",
      name: "action",
      message: "Pilih Skema Tabel",
      choices: await getTableSchema(),
    },
  ];
  const selectTableSchemaAnswer = await inquirer.prompt(
    selectTableSchemaQuestions
  );

  selectTableNames(selectTableSchemaAnswer.action);
}

async function selectTableNames(namaSkema) {
  const selectTableNameQuestions = [
    {
      type: "list",
      name: "action",
      message: "Pilih Tabel",
      choices: await getTableNames(namaSkema),
    },
  ];
  const selectTableNameAnswer = await inquirer.prompt(selectTableNameQuestions);

  selectReportDesigner(
    namaSkema + "." + selectTableNameAnswer.action,
    selectTableNameAnswer.action
  );
}

async function selectReportDesigner(namaTableFull, namaTable) {
  const selectReportDesignerQuestions = [
    {
      type: "list",
      name: "action",
      message: "Pilih Desain Laporan",
      choices: ["Group By", "Exit"],
    },
  ];
  const selectReportDesignerAnswer = await inquirer.prompt(
    selectReportDesignerQuestions
  );

  switch (selectReportDesignerAnswer.action) {
    case "Group By":
      await pilihOperasi(namaTable, namaTableFull);
      break;
    case "Exit":
      console.log("Exiting application...");
      process.exit(); // Exits the application
  }
}

async function pilihOperasi(namaTable, namaTableFull) {
  const pilihOperasiQuestion = [
    {
      type: "list",
      name: "action",
      message: "Pilih Kolom Untuk dikelompokkan",
      choices: ["Jumlah", "Hitung", "Rata-Rata"],
    },
  ];
  const pilihOperasiAnswer = await inquirer.prompt(pilihOperasiQuestion);

  await pilihKolom(namaTable, namaTableFull, pilihOperasiAnswer.action);
}
async function pilihKolom(namaTable, namaTableFull, operasi) {
  const pilihKolomKlpQuestion = [
    {
      type: "list",
      name: "action",
      message: "Pilih Kolom Untuk dikelompokkan",
      choices: await getColumns(namaTable),
    },
  ];
  const pilihKolomKlpAnswer = await inquirer.prompt(pilihKolomKlpQuestion);

  const pilihKolomOperasiQuestion = [
    {
      type: "list",
      name: "action",
      message: "Pilih Kolom Untuk dioperasikan (harus angka)",
      choices: await getColumns(namaTable),
    },
  ];
  const pilihKolomOperasiAnswer = await inquirer.prompt(
    pilihKolomOperasiQuestion
  );

  generateSalesReport(
    namaTableFull,
    pilihKolomOperasiAnswer.action,
    pilihKolomKlpAnswer.action,
    operasi
  );
}
main();
