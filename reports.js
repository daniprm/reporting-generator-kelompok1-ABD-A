import sql from "mssql";
import { sqlConfig } from "./config.js";
import util from "util";
import Table from "cli-table3";

export async function generateGroupByReport(
  namaTable,
  kolomAgregasi,
  kolomKelompok,
  agregasi,
  isFilter
) {
  try {
    await sql.connect(sqlConfig);
    let result;
    if (isFilter) {
      switch (agregasi) {
        case "Jumlah":
          result = await sql.query(`
            SELECT ${kolomKelompok} SUM(${kolomAgregasi}) as 'Jumlah ${kolomAgregasi}' FROM ${namaTable} GROUP BY ${kolomKelompok} ''
          `);
          break;
        case "Hitung":
          result = await sql.query(`
            SELECT ${kolomKelompok}, COUNT(${kolomAgregasi}) as 'Jumlah ${kolomAgregasi}' FROM ${namaTable} GROUP BY ${kolomKelompok}
          `);
          break;
        case "Rata-Rata":
          result = await sql.query(`
            SELECT ${kolomKelompok}, AVG(${kolomAgregasi}) as 'Rata-Rata ${kolomAgregasi}' FROM ${namaTable} GROUP BY ${kolomKelompok}
          `);
          break;
      }
    } else {
      switch (agregasi) {
        case "Jumlah":
          result = await sql.query(`
            SELECT ${kolomKelompok}, SUM(${kolomAgregasi}) as 'Jumlah ${kolomAgregasi}' FROM ${namaTable} GROUP BY ${kolomKelompok}
          `);
          break;
        case "Hitung":
          result = await sql.query(`
            SELECT ${kolomKelompok}, COUNT(${kolomAgregasi}) as 'Jumlah ${kolomAgregasi}' FROM ${namaTable} GROUP BY ${kolomKelompok}
          `);
          break;
        case "Rata-Rata":
          result = await sql.query(`
            SELECT ${kolomKelompok}, AVG(${kolomAgregasi}) as 'Rata-Rata ${kolomAgregasi}' FROM ${namaTable} GROUP BY ${kolomKelompok}
          `);
          break;
      }
    }

    console.log("\n Laporan berhasil dibuat!");

    // console.log("======================================");

    // // result.recordset.forEach((record) => {
    // //   console.log(`${record}`);
    // // });
    // console.log(util.inspect(result.recordset, { maxArrayLength: null }));

    // console.log("======================================");
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
export async function generatePivotReport() {
  //Variable from index
  //Case to operate on variable
}

export async function generateFilterReport(
  tableName,
  displayColumns,
  filterColumn,
  conditions,
  elseText
) {
  try {
    await sql.connect(sqlConfig);
    let query = `SELECT ${displayColumns}, CASE `; // Tambahkan koma di sini untuk memisahkan kolom dan CASE

    conditions.forEach((condition, index) => {
      if (condition.filterType === "LIKE") {
        query += `WHEN ${filterColumn} LIKE '%${condition.condition}%' THEN '${condition.text}' `;
      } else {
        const operator =
          condition.filterType === "="
            ? "="
            : condition.filterType === ">"
            ? ">"
            : condition.filterType === "<"
            ? "<"
            : "";

        query += `WHEN ${filterColumn} ${operator} '${condition.condition}' THEN '${condition.text}' `;
      }
    });

    query += `ELSE '${elseText}' END AS Result FROM ${tableName}`;

    console.log("Executing query:", query); // Log the query before execution

    const result = await sql.query(query);
    console.log("Query executed successfully.");

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

    return result.recordset;
  } catch (error) {
    console.error("Error generating filter report:", error); // Log errors if any
    throw error;
  }
}
