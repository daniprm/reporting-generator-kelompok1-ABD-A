import inquirer from "inquirer";
import { authenticateUser } from "./auth.js";
import { exportSalesReportToExcel } from "./exportExcel.js";
import { generateGroupByReport } from "./reports.js";
import {
  getTableSchema,
  getTableNames,
  getColumns,
  getColumnsAngka,
} from "./getTables.js";
import { loginReports, databaseAuthReports } from "./authReports.js";

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
    menuAwal();
    // ==================Menu Awal=========================
    async function menuAwal() {
      const mainQuestions = [
        {
          type: "list",
          name: "action",
          message: "Menu Utama",
          choices: [
            "Kelompokkan Berdasarkan Kolom",
            "Pivot Data",
            "Lihat Semua Data",
            "Laporan Autentikasi",
            "Keluar",
          ],
        },
      ];

      const mainAnswers = await inquirer.prompt(mainQuestions);

      // Handle the selection
      switch (mainAnswers.action) {
        case "Kelompokkan Berdasarkan Kolom":
          groupBy();
          // console.log("Generating report...");
          // await generateSalesReport(); // Output will be displayed in terminal
          // await exportSalesReportToExcel();
          // console.log("Report has been exported successfully.");
          break;
        case "Pivot Data":
          getColumnPivot();

          break;
        case "Lihat Semua Data":
          tampilSemua();

          break;
        case "Laporan Autentikasi":
          await laporanAutentikasi();
          break;
        case "Keluar":
          console.log("Keluar Dari Aplikasi...");
          process.exit(); // Keluar dari Aplikasi
      }
    }
    // ==================End Of Menu Awal=========================

    // ==================Ngambil Data tabel (skema & nama tabel full)==============
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
      return selectTableSchemaAnswer.action;
    }

    async function selectTableNames(namaSkema) {
      const selectTableNameQuestions = [
        {
          type: "list",
          name: "action",
          message: "Pilih Tabel",
          choices: [...(await getTableNames(namaSkema)), "Kembali"],
        },
      ];
      const selectTableNameAnswer = await inquirer.prompt(
        selectTableNameQuestions
      );

      const tableData = {
        skema: namaSkema,
        namaTabel: selectTableNameAnswer.action,
        namaTabelFull: namaSkema + "." + selectTableNameAnswer.action,
      };

      if (selectTableNameAnswer.action === "Kembali") selectTableSchema();
      else return tableData;
    }

    //Fungsinya seperti checkbox
    async function pilihBanyakKolom(namaTabel) {
      const banyakKolomQuestion = [
        {
          type: "checkbox",
          name: "dataKolom",
          message: "Pilih Kolom",
          choices: [...(await getColumns(namaTabel))],
        },
      ];

      const banyakKolomAnswers = await inquirer.prompt(banyakKolomQuestion);

      let kolomHasil = "";
      banyakKolomAnswers.dataKolom.forEach((res) => (kolomHasil += res + ", "));
      console.log(kolomHasil);
      return kolomHasil;
    }

    async function pilihKolom(namaTabel) {
      const pilihKolomQuestion = [
        {
          type: "list",
          name: "action",
          message: "Pilih Kolom",
          choices: [...(await getColumns(namaTabel))],
        },
      ];
      const pilihKolomAnswer = await inquirer.prompt(pilihKolomQuestion);
      return pilihKolomAnswer.action;
    }
    async function pilihKolomAngka(namaTabel) {
      const pilihKolomQuestion = [
        {
          type: "list",
          name: "action",
          message: "Pilih Kolom",
          choices: [...(await getColumnsAngka(namaTabel))],
        },
      ];
      const pilihKolomAnswer = await inquirer.prompt(pilihKolomQuestion);
      return pilihKolomAnswer.action;
    }

    async function pilihAgregasi() {
      const pilihAgregasiQuestion = [
        {
          type: "list",
          name: "action",
          message: "Pilih Operasi Agregasi",
          choices: ["Jumlah", "Hitung", "Rata-Rata", "Kembali"],
        },
      ];
      const pilihAgregasiAnswer = await inquirer.prompt(pilihAgregasiQuestion);
      return pilihAgregasiAnswer.action;
    }
    // ==================End of Ngambil Data tabel (skema, nama tabel full, kolom)==============

    // PEMBAGIAN KERJA MULAI DI SINI
    // PIVOTTT---------------------------------------------------------------------------------
    async function getColumnPivot() {
      const namaSkema = await selectTableSchema();
      const dataTabel = await selectTableNames(namaSkema);
      const sourceColumn = await pilihBanyakKolom(dataTabel.namaTabel);
      const pilihanAgregasi = await pilihAgregasi();
      const pivotColumn = await pilihKolom(dataTabel.namaTabel);
      const pivotColumnDetail = await getColumnPivot(
        dataTabel.namaTabel,
        pivotColumn
      );

      if (pilihanAgregasi === "Kembali") getColumnPivot();
      else {
        console.log(`Pilih Kolom Untuk Di${pilihanAgregasi.toLowerCase()}`);
        let kolomAgregasi;
        pilihanAgregasi === "Hitung"
          ? (kolomAgregasi = await pilihKolom(dataTabel.namaTabel))
          : (kolomAgregasi = await pilihKolomAngka(dataTabel.namaTabel));

        generatePivotReport(
          dataTabel,
          kolomAgregasi,
          sourceColumn,
          pivotColumn,
          pivotColumnDetail,
          pilihanAgregasi
        );
        endQuestion();
      }
    }
    // END PIVOTTT------------------------------------------------------------------------------

    async function tampilSemua() {}
    // =======================================GROUP BY==========================================
    async function groupBy() {
      const namaSkema = await selectTableSchema();
      const dataTabel = await selectTableNames(namaSkema);
      const pilihanAgregasi = await pilihAgregasi();

      if (pilihanAgregasi === "Kembali") groupBy();
      else {
        console.log(`Pilih Kolom Untuk Di${pilihanAgregasi.toLowerCase()}`);
        let kolomAgregasi;
        pilihanAgregasi === "Hitung"
          ? (kolomAgregasi = await pilihKolom(dataTabel.namaTabel))
          : (kolomAgregasi = await pilihKolomAngka(dataTabel.namaTabel));
        console.log("Pilih Kolom Untuk Dikelompokkan");
        const kolomKelompok = await pilihKolom(dataTabel.namaTabel);

        const pilihLangkahBerikutnya = [
          {
            type: "list",
            name: "action",
            message: "Pilih Kolom",
            choices: ["Filter Data", "Tampilkan Data"],
          },
        ];
        const pilihLangkahBerikutnyaAnswer = await inquirer.prompt(
          pilihLangkahBerikutnya
        );
        if (pilihLangkahBerikutnyaAnswer.action === "Tampilkan Data") {
          generateGroupByReport(
            dataTabel.namaTabelFull,
            kolomAgregasi,
            kolomKelompok,
            pilihanAgregasi,
            false
          );
          endQuestion();
        } else {
        }
      }
    }

    // =======================================End of GROUP BY==========================================

    async function endQuestion() {
      const endQuestions = [
        {
          type: "list",
          name: "action",
          message: "Pilih Langkah Berikutnya",
          choices: ["Export Data Ke Excel", "Kembali Menu Utama", "Keluar"],
        },
      ];

      const endAnswer = await inquirer.prompt(endQuestions);

      switch (endAnswer.action) {
        case "Kembali Menu Utama":
          menuAwal();
          break;
        case "Keluar":
          console.log("Keluar Dari Aplikasi...");
          process.exit(); // Keluar dari Aplikasi
      }
    }

    async function laporanAutentikasi() {
      const tingkatAutentikasiQuestions = [
        {
          type: "list",
          name: "action",
          message: "Pilih Tingkat Autentikasi: ",
          choices: [
            "Login / Server (Login ke SQL Server di SSMS/Azure terlebih dahulu)",
            "Database",
          ],
        },
      ];
      const tingkatAutentikasiAnswer = await inquirer.prompt(
        tingkatAutentikasiQuestions
      );
      if (tingkatAutentikasiAnswer.action === "Database") {
        await databaseAuthReports();
        endQuestion();
      } else {
        await loginReports();
        endQuestion();
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
