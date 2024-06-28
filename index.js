import inquirer from "inquirer";
import { authenticateUser } from "./auth.js";
import { exportLaporanToExcel } from "./exportExcel.js";
import { generateGroupByReport, generateFilterReport } from "./reports.js";
import {
  getTableSchema,
  getTableNames,
  getColumns,
  getColumnsAngka,
} from "./getTables.js";
import { loginReports, databaseAuthReports } from "./authReports.js";
import dayjs from "dayjs";

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
            "Lihat Semua Data",
            "Kelompokkan Berdasarkan Kolom",
            "Pivot Data",
            "Filter Data",
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
          break;
        case "Pivot Data":
          getColumnPivot();

          break;
        case "Filter Data":
          applyFilter();

          break;
        case "Lihat Semua Data":
          tampilSemua();

          break;
        case "Laporan Autentikasi":
          await laporanAutentikasi();
          break;
        case "Keluar":
          console.log("Keluar Dari Aplikasi...");
          process.exit();
      }
    }
    // ==================End Of Menu Awal=========================

    // ==================Ngambil Data tabel (skema, nama tabel full, kolom)==============
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
      banyakKolomAnswers.dataKolom.forEach((res) => (kolomHasil += res + ","));
      kolomHasil = kolomHasil.slice(0, -1);
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

        const hasil = await generatePivotReport(
          dataTabel.namaTabelFULL,
          kolomAgregasi,
          sourceColumn,
          pivotColumn,
          pivotColumnDetail,
          pilihanAgregasi
        );
        const namaLaporan = `Laporan Pivot Kolom ${sourceColumn} Dan ${pivotColumn} Tabel ${
          dataTabel.namaTabel
        } ${dayjs().format("DD MMM YYYY (hh.mm A)")}`;
        endQuestion(hasil, namaLaporan);
      }
    }
    // END PIVOTTT------------------------------------------------------------------------------

    async function tampilSemua() {}

    // =======================================FILTER DATA==========================================
    async function promptNumberOfConditions() {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "count",
          message:
            "Masukkan jumlah kondisi yang ingin Anda gunakan (1, 2, atau 3):",
          validate: function (value) {
            var valid =
              !isNaN(parseFloat(value)) &&
              parseInt(value) >= 1 &&
              parseInt(value) <= 3;
            return valid || "Masukkan angka yang valid antara 1 dan 3!";
          },
          filter: Number,
        },
      ]);
      return answers.count;
    }

    async function applyFilter() {
      const schema = await selectTableSchema();
      const tableData = await selectTableNames(schema);

      if (tableData.namaTabel === "Kembali") {
        return applyFilter(); // Panggil ulang fungsi jika pengguna memilih "Kembali"
      }

      console.log("Pilih kolom yang akan ditampilkan:");
      const displayColumns = await pilihBanyakKolom(tableData.namaTabel);
      if (!displayColumns) {
        console.log(
          "No columns selected for display. Exiting filter application."
        );
        return;
      }

      console.log("Pilih kolom untuk difilter:");
      const filterColumn = await pilihKolom(tableData.namaTabel);
      const isNumericColumn = await getColumnsAngka(tableData.namaTabel);

      const numberOfConditions = await promptNumberOfConditions(); // Meminta jumlah kondisi
      const conditions = [];

      for (let i = 0; i < numberOfConditions; i++) {
        console.log(`Pilih kondisi ke-${i + 1}:`);
        const text = await inquirer.prompt([
          {
            type: "input",
            name: "text",
            message: `Masukkan teks yang akan ditampilkan untuk kondisi ${
              i + 1
            }:`,
          },
        ]);

        if (isNumericColumn.includes(filterColumn)) {
          console.log(`Pilih tipe filter untuk kolom ${filterColumn}:`);
          const { filterType, condition } = await promptNumericFilter();
          conditions.push({
            type: "numeric",
            filterType,
            condition,
            text: text.text,
          });
        } else {
          const condition = await promptTextFilter();
          conditions.push({
            type: "text",
            condition,
            filterType: "LIKE",
            text: text.text,
          });
        }
      }

      const elseText = await inquirer.prompt([
        {
          type: "input",
          name: "elseText",
          message:
            "Masukkan teks yang akan ditampilkan jika tidak ada kondisi yang terpenuhi:",
        },
      ]);

      const hasil = await generateFilterReport(
        tableData.namaTabelFull,
        displayColumns,
        filterColumn,
        conditions,
        elseText.elseText
      );
      console.log("Laporan berhasil dibuat.");
      const namaLaporan = `Laporan Filter Kolom ${filterColumn} Tabel ${
        tableData.namaTabel
      } ${dayjs().format("DD MMM YYYY (hh.mm A)")}`;

      // Tanyakan langkah berikutnya
      endQuestion(hasil, namaLaporan);
    }

    async function promptNumericFilter() {
      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "filterType",
          message: "Pilih kondisi filter numerik:",
          choices: [
            { name: "Equals", value: "=" },
            { name: "Greater than", value: ">" },
            { name: "Less than", value: "<" },
          ],
        },
        {
          type: "input",
          name: "condition",
          message: "Masukkan nilai untuk kondisi:",
        },
      ]);
      return answers;
    }

    async function promptTextFilter() {
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "condition",
          message:
            "Masukkan kata kunci untuk filtering (akan menggunakan LIKE):",
        },
      ]);
      return answer.condition;
    }

    // =======================================END OF FILTER DATA==========================================

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
        const kolomKelompok = await pilihBanyakKolom(dataTabel.namaTabel);

        const pilihLangkahBerikutnya = [
          {
            type: "list",
            name: "action",
            message: "Pilih Salah Satu",
            choices: ["Tampilkan Data", "Filter Hasil Agregasi"],
          },
        ];
        const pilihLangkahBerikutnyaAnswer = await inquirer.prompt(
          pilihLangkahBerikutnya
        );

        const namaLaporan = `Laporan ${pilihanAgregasi} ${kolomAgregasi} Tabel ${
          dataTabel.namaTabel
        } ${dayjs().format("DD MMM YYYY (hh.mm A)")}`;
        if (pilihLangkahBerikutnyaAnswer.action === "Tampilkan Data") {
          const hasil = await generateGroupByReport(
            dataTabel.namaTabelFull,
            kolomAgregasi,
            kolomKelompok,
            pilihanAgregasi,
            0
          );

          endQuestion(hasil, namaLaporan);
        } else {
          const pilihOperator = [
            {
              type: "list",
              name: "action",
              message: "Pilih Salah Satu",
              choices: [">", "<", "<=", ">=", "="],
            },
          ];
          const pilihOperatorAnswer = await inquirer.prompt(pilihOperator);
          const masukkanDataKondisi = [
            {
              type: "input",
              name: "action",
              message: "Masukkan angka untuk operasi filter:",
              validate: function (value) {
                const valid = !isNaN(parseFloat(value));
                return valid || "Silakan masukkan angka yang valid";
              },
              filter: Number,
            },
          ];
          const masukkanDataKondisiAnswer = await inquirer.prompt(
            masukkanDataKondisi
          );
          const teksHasilFilter = [
            {
              type: "input",
              name: "action",
              message: "Masukkan teks hasil filter jika memenuhi kondisi:",
            },
          ];
          const teksHasilFilterAnswer = await inquirer.prompt(teksHasilFilter);
          const teksBukanFilter = [
            {
              type: "input",
              name: "action",
              message:
                "Masukkan teks hasil filter jika tidak memenuhi kondisi:",
            },
          ];
          const teksBukanFilterAnswer = await inquirer.prompt(teksBukanFilter);

          const hasil = await generateGroupByReport(
            dataTabel.namaTabelFull,
            kolomAgregasi,
            kolomKelompok,
            pilihanAgregasi,
            1,
            pilihOperatorAnswer.action,
            masukkanDataKondisiAnswer.action,
            teksHasilFilterAnswer.action,
            teksBukanFilterAnswer.action
          );

          endQuestion(hasil, namaLaporan);
        }
      }
    }

    // =======================================End of GROUP BY==========================================

    async function endQuestion(dataHasil, namaLaporan) {
      const endQuestions = [
        {
          type: "list",
          name: "action",
          message: "Pilih Langkah Berikutnya",
          choices: [
            "Export Data Ke Excel Untuk Melihat Selengkapnya",
            "Kembali Menu Utama",
            "Keluar",
          ],
        },
      ];

      const endAnswer = await inquirer.prompt(endQuestions);

      switch (endAnswer.action) {
        case "Kembali Menu Utama":
          menuAwal();
          break;
        case "Export Data Ke Excel Untuk Melihat Selengkapnya":
          exportLaporanToExcel(dataHasil, namaLaporan);
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
    main();
  }
}

main();
