import ExcelJS from "exceljs";
import { generateGroupByReport } from "./reports.js";

export async function exportSalesReportToExcel() {
  const data = await generateSalesReport();
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Report");

  worksheet.columns = [
    { header: "Category", key: "Category", width: 25 },
    { header: "Total Sales", key: "TotalSales", width: 15 },
  ];

  data.forEach((record) => {
    worksheet.addRow(record);
  });

  worksheet.getRow(1).font = { bold: true };

  try {
    await workbook.xlsx.writeFile("SalesReport.xlsx");
    console.log("Excel file was written successfully.");
  } catch (error) {
    console.error("Error writing Excel file:", error);
    throw error;
  }
}
