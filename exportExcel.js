import ExcelJS from "exceljs";
import inquirer from "inquirer";
import path from "path";
import fs from "fs";

export async function exportLaporanToExcel(data, namaLaporan) {
  // Meminta input dari pengguna untuk menentukan lokasi direktori
  const { directory } = await inquirer.prompt([
    {
      type: "input",
      name: "directory",
      message: `Masukkan lokasi direktori untuk menyimpan file ${namaLaporan}.xlsx:`,
      validate: function (input) {
        // Validasi untuk memastikan input adalah direktori yang valid
        if (fs.existsSync(input) && fs.lstatSync(input).isDirectory()) {
          return true;
        }
        return "Direktori tidak valid. Silakan masukkan lokasi direktori yang benar.";
      },
    },
  ]);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(namaLaporan);

  const dataKolom = [];
  Object.keys(data[0]).forEach((res) => {
    dataKolom.push({ header: res, key: res });
  });
  worksheet.columns = dataKolom;

  data.forEach((record) => {
    worksheet.addRow(record);
  });

  worksheet.getRow(1).font = { bold: true };

  // Menggabungkan direktori dengan nama file untuk mendapatkan path lengkap
  const filePath = path.join(directory, namaLaporan + ".xlsx");

  try {
    await workbook.xlsx.writeFile(filePath);
    console.log(`File Excel Laporan Berhasil Dibuat di ${filePath}`);
  } catch (error) {
    console.error("Error writing Excel file:", error);
    throw error;
  }
}
