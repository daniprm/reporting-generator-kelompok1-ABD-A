import sql from "mssql";
import { sqlConfig } from "./config.js";
// import util from "util";
import Table from "cli-table3";

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
          SELECT ${kolomKelompok}, COUNT(${kolomAgregasi}) as Jumlah FROM ${namaTable} GROUP BY ${kolomKelompok}
        `);
        break;
      case "Rata-Rata":
        result = await sql.query(`
          SELECT ${kolomKelompok}, AVG(${kolomAgregasi}) as 'Rata-Rata' FROM ${namaTable} GROUP BY ${kolomKelompok}
        `);
        break;
    }

    console.log("\n Laporan berhasil dibuat!");

    // result.recordset.forEach((record) => {
    //   console.log(`${record}`);
    // });
    // console.log(util.inspect(result.recordset, { maxArrayLength: null }));

    // Membuat tabel CLI
    const table = new Table({
      head: Object.keys(result.recordset[0]),
    });

    // Menambahkan data ke tabel
    result.recordset.forEach((record) => {
      let temp = [];
      Object.values(record).forEach((value) => {
        temp.push(value.toString()); // Output: abc, kls
      });
      table.push(temp);
    });

    // Menampilkan tabel di console
    console.log(table.toString());

    console.log("Gunakan tombol panah pada keyboard untuk navigasi: ");

    return result.recordset;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}
