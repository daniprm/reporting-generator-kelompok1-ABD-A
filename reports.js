import sql from "mssql";
import { sqlConfig } from "./config.js";
import util from "util";
import Table from "cli-table3";

export async function generateGroupByReport(
  namaTable,
  kolomAgregasi,
  kolomKelompok,
  agregasi,
  isFilter,
  operator,
  dataKondisi,
  teksHasilKondisi,
  elseTeks
) {
  try {
    await sql.connect(sqlConfig);
    let result = await sql.query(`
      BEGIN
      
      DECLARE @isFilter BIT = ${isFilter}
      DECLARE @agregasi varchar(10) = '${agregasi}'
      
        IF @isFilter = 0
        BEGIN
          SELECT ${kolomKelompok}, 
          CASE 
            WHEN @agregasi = 'Hitung' THEN COUNT(${kolomAgregasi})
            WHEN @agregasi = 'Jumlah' THEN SUM(${kolomAgregasi})
            WHEN @agregasi = 'Rata-Rata' THEN AVG(${kolomAgregasi})
          END AS 'Hasil ${agregasi}'
          FROM ${namaTable}
          GROUP BY ${kolomKelompok};
          RETURN;
        END
        
        ELSE
        BEGIN
          
          DECLARE @operator varchar(2) = '${operator}'
          DECLARE @dataKondisi float = ${dataKondisi}
          DECLARE @teksHasilKondisi varchar(255) = '${teksHasilKondisi}'
          DECLARE @elseTeks varchar(255) = '${elseTeks}'
          SELECT ${kolomKelompok}, 
          CASE 
            WHEN @agregasi = 'Hitung' THEN COUNT(${kolomAgregasi})
            WHEN @agregasi = 'Jumlah' THEN SUM(${kolomAgregasi})
            WHEN @agregasi = 'Rata-Rata' THEN AVG(${kolomAgregasi})
          END AS 'Hasil ${agregasi}',
          CASE
            WHEN @operator = '>' THEN 
              CASE 
                WHEN @agregasi = 'Hitung' THEN
                  CASE
                    WHEN COUNT(${kolomAgregasi}) > @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Jumlah' THEN
                  CASE
                    WHEN SUM(${kolomAgregasi}) > @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Rata-Rata' THEN
                  CASE
                    WHEN AVG(${kolomAgregasi}) > @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
              END

            WHEN @operator = '<' THEN 
              CASE 
                WHEN @agregasi = 'Hitung' THEN
                  CASE
                    WHEN COUNT(${kolomAgregasi}) < @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Jumlah' THEN
                  CASE
                    WHEN SUM(${kolomAgregasi}) < @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Rata-Rata' THEN
                  CASE
                    WHEN AVG(${kolomAgregasi}) < @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
              END
            WHEN @operator = '=' THEN 
              CASE 
                WHEN @agregasi = 'Hitung' THEN
                  CASE
                    WHEN COUNT(${kolomAgregasi}) = @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Jumlah' THEN
                  CASE
                    WHEN SUM(${kolomAgregasi}) = @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Rata-Rata' THEN
                  CASE
                    WHEN AVG(${kolomAgregasi}) = @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
              END
            WHEN @operator = '>=' THEN 
              CASE 
                WHEN @agregasi = 'Hitung' THEN
                  CASE
                    WHEN COUNT(${kolomAgregasi}) >= @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Jumlah' THEN
                  CASE
                    WHEN SUM(${kolomAgregasi}) >= @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Rata-Rata' THEN
                  CASE
                    WHEN AVG(${kolomAgregasi}) >= @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
              END
            WHEN @operator = '<=' THEN 
              CASE 
                WHEN @agregasi = 'Hitung' THEN
                  CASE
                    WHEN COUNT(${kolomAgregasi}) <= @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Jumlah' THEN
                  CASE
                    WHEN SUM(${kolomAgregasi}) <= @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
                WHEN @agregasi = 'Rata-Rata' THEN
                  CASE
                    WHEN AVG(${kolomAgregasi}) <= @dataKondisi THEN @teksHasilKondisi
                    ELSE @elseTeks
                  END
              END
          END AS 'Hasil Filter'
          FROM ${namaTable}
          GROUP BY ${kolomKelompok};
        END
      END
      `);

    console.log("\n Laporan berhasil dibuat.");

    // console.log("======================================");

    // // result.recordset.forEach((record) => {
    // //   console.log(`${record}`);
    // // });
    // console.log(util.inspect(result.recordset, { maxArrayLength: null }));

    // console.log("======================================");

    showTable(result.recordset);

    console.log("Gunakan tombol panah pada keyboard untuk navigasi: ");

    return result.recordset;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}
export async function generateTableReport(namaTable, kolomTampil, jumlahBaris) {
  try {
    await sql.connect(sqlConfig);
    let result;
    if (isNaN(parseInt(jumlahBaris)))
      result = await sql.query(`
      SELECT ${kolomTampil} FROM ${namaTable}
    `);
    else {
      result = await sql.query(`
      SELECT TOP ${jumlahBaris} ${kolomTampil} FROM ${namaTable}
    `);
    }

    showTable(result.recordset);

    return result.recordset;
  } catch (error) {
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

    query += `ELSE '${elseText}' END AS Hasil FROM ${tableName}`;

    console.log("Executing query:", query); // Log the query before execution

    const result = await sql.query(query);
    console.log("Query executed successfully.");

    showTable(result.recordset);

    return result.recordset;
  } catch (error) {
    console.error("Error generating filter report:", error); // Log errors if any
    throw error;
  }
}

function showTable(data) {
  // Membuat tabel CLI
  const table = new Table({
    head: Object.keys(data[0]),
  });

  // Menambahkan data ke tabel
  data.forEach((record) => {
    let temp = [];
    Object.values(record).forEach((value) => {
      if (value === null) temp.push(value);
      else temp.push(value.toString()); // Output: abc, kls
    });
    table.push(temp);
  });

  // Menampilkan tabel di console
  console.log(table.toString());
}
