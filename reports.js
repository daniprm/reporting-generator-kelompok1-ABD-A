import sql from "mssql";
import { sqlConfig } from "./config.js";
import { getPivotColumnDetail } from "./getTables.js";
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
    let query;
    if (agregasi === "Hitung")
      query = `
      BEGIN
        DECLARE @isFilter BIT = ${isFilter}

        IF @isFilter = 0
        BEGIN
          SELECT ${kolomKelompok}, 
            COUNT(${kolomAgregasi}) AS 'Hasil ${agregasi}'
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
            COUNT(${kolomAgregasi}) AS 'Hasil ${agregasi}',
            CASE
              WHEN @operator = '>' THEN 
                CASE
                  WHEN COUNT(${kolomAgregasi}) > @dataKondisi THEN @teksHasilKondisi
                  ELSE @elseTeks
                END
              WHEN @operator = '<' THEN 
                CASE
                  WHEN COUNT(${kolomAgregasi}) < @dataKondisi THEN @teksHasilKondisi
                  ELSE @elseTeks
                END
              WHEN @operator = '=' THEN 
                CASE
                  WHEN COUNT(${kolomAgregasi}) = @dataKondisi THEN @teksHasilKondisi
                  ELSE @elseTeks
                END
              WHEN @operator = '>=' THEN 
                CASE
                  WHEN COUNT(${kolomAgregasi}) >= @dataKondisi THEN @teksHasilKondisi
                  ELSE @elseTeks
                END
              WHEN @operator = '<=' THEN 
                CASE
                  WHEN COUNT(${kolomAgregasi}) <= @dataKondisi THEN @teksHasilKondisi
                  ELSE @elseTeks
                END
            END AS 'Hasil Filter'
          FROM ${namaTable}
          GROUP BY ${kolomKelompok};
        END
      END

    `;
    else {
      query = `
      BEGIN
        DECLARE @isFilter BIT = ${isFilter}
        DECLARE @agregasi varchar(10) = '${agregasi}'

        IF @isFilter = 0
        BEGIN
          SELECT ${kolomKelompok}, 
            CASE 
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
              WHEN @agregasi = 'Jumlah' THEN SUM(${kolomAgregasi})
              WHEN @agregasi = 'Rata-Rata' THEN AVG(${kolomAgregasi})
            END AS 'Hasil ${agregasi}',
            CASE
              WHEN @operator = '>' THEN 
                CASE 
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

      `;
    }
    let result = await sql.query(query);

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
// export async function pivotGroupByResult(tabel) {
//   let namaKolom = "";

//   Object.keys(tabel[0]).forEach((res) => {
//     namaKolom += "'" + res + "',";
//   });
//   namaKolom = namaKolom.slice(0, -1);
//   console.log(nama)

//   await sql.connect(sqlConfig);
//   const tipeDataKolom = await sql.query(`
//     SELECT DATA_TYPE
//     FROM INFORMATION_SCHEMA.COLUMNS
//     WHERE TABLE_NAME = '${tabel}'
//       AND COLUMN_NAME IN (${namaKolom});
//     `);
//   console.log(tipeDataKolom.recordset);
//   let values = "";
//   tabel.forEach((res) => {
//     let temp = "";
//     Object.values(res).forEach((data) => {
//       if (!isNaN(parseFloat(data))) temp += data + ",";
//       else temp += "'" + data + "',";
//     });
//     temp = temp.slice(0, -1);

//     values += `INSERT INTO #tabelAwal VALUES (${temp});`;
//   });
//   console.log(values);
//   // let result = await sql.query(`
//   //     IF OBJECT_ID('tempdb..#tabelAwal') IS NOT NULL
//   //     BEGIN
//   //         DROP TABLE #tabelAwal;
//   //     END

//   //     CREATE TABLE #tabelAwal (
//   //         ID INT,
//   //         Nama VARCHAR(50)
//   //     );

//   //         INSERT INTO #tabelAwal (ID, Nama)
//   //         VALUES (@Counter, 'Nama ' + CAST(@Counter AS VARCHAR(10)));

//   //     -- Select untuk menampilkan hasil
//   //     SELECT * FROM #tabelAwal;
//   //     `);
// }
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
export async function generatePivotReport(
  dataTabel,
  kolomAgregasi,
  sourceColumn,
  pivotColumn,
  pivotColumnDetail,
  pilihanAgregasi
) {
  try {
    let result = ``;
    switch (pilihanAgregasi) {
      case "Hitung":
        await sql.connect(sqlConfig);
        result = await sql.query(`
          SELECT *
          FROM (
            SELECT ${sourceColumn} FROM ${dataTabel}
          )AS Src
          PIVOT(
            COUNT(${kolomAgregasi})
            FOR ${pivotColumn} IN (${pivotColumnDetail})
          )AS Pvt
        `);
        break;
      case "Jumlah":
        await sql.connect(sqlConfig);
        result = await sql.query(`
          SELECT *
          FROM (
            SELECT ${sourceColumn} FROM ${dataTabel}
          )AS Src
          PIVOT(
            SUM(${kolomAgregasi})
            FOR ${pivotColumn} IN (${pivotColumnDetail})
          )AS Pvt
          `);
        break;
      case "Rata-Rata":
        await sql.connect(sqlConfig);
        result = await sql.query(`
          SELECT *
          FROM (
            SELECT ${sourceColumn} FROM ${dataTabel}
          )AS Src
          PIVOT(
            AVG(${kolomAgregasi})
            FOR ${pivotColumn} IN (${pivotColumnDetail})
          
          )AS Pvt
          `);
        break;
    }

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
