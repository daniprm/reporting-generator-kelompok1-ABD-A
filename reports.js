import sql from "mssql";
import { sqlConfig } from "./config.js";

export async function generateSalesReport(
  namaTable,
  kolomOperasi,
  kolomKelompok,
  operasi
) {
  try {
    await sql.connect(sqlConfig);
    let result;
    switch (operasi) {
      case "Jumlah":
        result = await sql.query(`
          SELECT ${kolomKelompok}, SUM(${kolomOperasi}) as Jumlah FROM ${namaTable} GROUP BY ${kolomKelompok}
        `);
        break;
      case "Hitung":
        result = await sql.query(`
          SELECT ${kolomKelompok}, COUNT(${kolomOperasi}) as Hitung FROM ${namaTable} GROUP BY ${kolomKelompok}
        `);
        break;
      case "Rata-Rata":
        result = await sql.query(`
          SELECT ${kolomKelompok}, AVG(${kolomOperasi}) as Rata-Rata FROM ${namaTable} GROUP BY ${kolomKelompok}
        `);
        break;
    }

    console.log("Report generated successfully:");

    console.log("=======================================");
    // result.recordset.forEach((record) => {
    //   console.log(`${record}`);
    // });
    console.log(result.recordset);
    console.log("=======================================");

    return result.recordset;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}
