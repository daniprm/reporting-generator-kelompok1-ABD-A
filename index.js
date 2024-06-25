import inquirer from "inquirer";
import { authenticateUser } from "./auth.js";
import { exportSalesReportToExcel } from "./exportExcel.js";
import { generateReport } from "./reports.js";
import { getTableSchema, getTableNames, getColumns } from "./getTables.js";

async function main() {
  console.log("Masukkan data untuk autentikasi database: ");
  const { user, password, database, server } = await inquirer.prompt([
    { type: "input", name: "user", message: "User:" },
    { type: "password", name: "password", message: "Password:" },
    { type: "input", name: "database", message: "Database:" },
    { type: "input", name: "server", message: "Server:" },
  ]);

  try {
    const token = await authenticateUser(user, password, database, server);

    console.log("Autentikasi Berhasil!");

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
      choices: [...(await getTableNames(namaSkema)), "Back"],
    },
  ];
  const selectTableNameAnswer = await inquirer.prompt(selectTableNameQuestions);

  selectTableNameAnswer.action === "Back"
    ? selectTableSchema()
    : selectReportDesigner(
        namaSkema + "." + selectTableNameAnswer.action,
        selectTableNameAnswer.action
      );
}

// ============================REPORT DESIGNER==========================================
async function selectReportDesigner(namaTableFull, namaTable) {
  const selectReportDesignerQuestions = [
    {
      type: "list",
      name: "action",
      message: "Pilih Desain Laporan",
      choices: ["Group By", "Back"],
    },
  ];
  const selectReportDesignerAnswer = await inquirer.prompt(
    selectReportDesignerQuestions
  );

  switch (selectReportDesignerAnswer.action) {
    case "Group By":
      await pilihAgregasi(namaTableFull, namaTable);
      break;
    case "Back":
      selectTableSchema();
  }
}
//=================================END OF REPORT DESIGNER===================================

// =======================================GROUP BY==========================================
async function pilihAgregasi(namaTableFull, namaTable) {
  const pilihAgregasiQuestion = [
    {
      type: "list",
      name: "action",
      message: "Pilih Kolom Untuk dikelompokkan",
      choices: ["Jumlah", "Hitung", "Rata-Rata", "Back"],
    },
  ];
  const pilihAgregasiAnswer = await inquirer.prompt(pilihAgregasiQuestion);

  pilihAgregasiAnswer.action === "Back"
    ? selectReportDesigner(namaTableFull, namaTable)
    : await pilihKolom(namaTableFull, namaTable, pilihAgregasiAnswer.action);
}
async function pilihKolom(namaTableFull, namaTable, agregasi) {
  const pilihKolomKlpQuestion = [
    {
      type: "list",
      name: "action",
      message: "Pilih Kolom Untuk dikelompokkan",
      choices: [...(await getColumns(namaTable))],
    },
  ];
  const pilihKolomKlpAnswer = await inquirer.prompt(pilihKolomKlpQuestion);

  const pilihKolomAgregasiQuestion = [
    {
      type: "list",
      name: "action",
      message: "Pilih Kolom Untuk diagregasikan (harus angka)",
      choices: [...(await getColumns(namaTable)), "Back"],
    },
  ];
  const pilihKolomAgregasiAnswer = await inquirer.prompt(
    pilihKolomAgregasiQuestion
  );

  pilihKolomAgregasiAnswer.action === "Back"
    ? pilihAgregasi(namaTableFull, namaTable)
    : generateReport(
        namaTableFull,
        pilihKolomAgregasiAnswer.action,
        pilihKolomKlpAnswer.action,
        agregasi
      );
}
//==========================END GROUP BY===========================================
main();
