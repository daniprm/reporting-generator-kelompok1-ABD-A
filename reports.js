import sql from "mssql";
import { sqlConfig } from "./config.js";

export async function generateReport(
  namaTable,
  kolomAgregasi,
  kolomKelompok,
  agregasi
) {
  try {
    await sql.connect(sqlConfig);
    let result;
    switch (agregasi) {
      case "Jumlah":
        result = await sql.query(`
          SELECT ${kolomKelompok}, SUM(${kolomAgregasi}) as Jumlah FROM ${namaTable} GROUP BY ${kolomKelompok}
        `);
        break;
      case "Hitung":
        result = await sql.query(`
          SELECT ${kolomKelompok}, COUNT(${kolomAgregasi}) as Hitung FROM ${namaTable} GROUP BY ${kolomKelompok}
        `);
        break;
      case "Rata-Rata":
        result = await sql.query(`
          SELECT ${kolomKelompok}, AVG(${kolomAgregasi}) as Rata-Rata FROM ${namaTable} GROUP BY ${kolomKelompok}
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
