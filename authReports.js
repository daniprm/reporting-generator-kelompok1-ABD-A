import sql from "mssql";
import { sqlConfig } from "./config.js";
// import util from "util";
import Table from "cli-table3";

export async function loginReports() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query(`
        SELECT DISTINCT
            s.login_name AS 'Login Name',
            rp.name AS 'Role'
        FROM 
            sys.dm_exec_sessions s
        INNER JOIN 
            sys.server_principals sp ON s.login_name = sp.name
        INNER JOIN 
            sys.server_role_members rm ON sp.principal_id = rm.member_principal_id
        INNER JOIN 
            sys.server_principals rp ON rm.role_principal_id = rp.principal_id
        WHERE 
            s.is_user_process = 1 
            AND s.program_name = 'Microsoft SQL Server Management Studio'
            AND rp.type = 'R';
        `);

    console.log("Data user yang sedang login saat ini:");
    // Membuat tabel CLI
    const table = new Table({
      head: Object.keys(result.recordset[0]),
    });

    // Menambahkan data ke tabel
    result.recordset.forEach((record) => {
      let temp = [];
      Object.values(record).forEach((value) => {
        temp.push(value);
      });
      table.push(temp);
    });

    // Menampilkan tabel di console
    console.log(table.toString());

    return result.recordset;
  } catch (error) {
    console.error(
      "Terjadi kesalhan saat membuat laporan login, pastikan telah terkoneksi dengan SQL Server dengan Azure / SSMS"
    );
  }
}
export async function databaseAuthReports() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query(`
        SELECT 
            dp.name AS 'Database User Name',
            rp.name AS 'Database Role'
        FROM 
            sys.database_principals dp
        LEFT JOIN 
            sys.database_role_members drm ON dp.principal_id = drm.member_principal_id
        LEFT JOIN 
            sys.database_principals rp ON drm.role_principal_id = rp.principal_id
        WHERE 
            dp.type IN ('S', 'U', 'G')
            AND rp.type = 'R' 
        `);

    console.log("Data user database:");

    // Membuat tabel CLI
    const table = new Table({
      head: Object.keys(result.recordset[0]),
      colWidths: [30, 20],
    });

    // Menambahkan data ke tabel
    result.recordset.forEach((record) => {
      let temp = [];
      Object.values(record).forEach((value) => {
        temp.push(value);
      });
      table.push(temp);
    });

    // Menampilkan tabel di console
    console.log(table.toString());

    return result.recordset;
  } catch (error) {
    console.error("Error generating report:", error);
  }
}
