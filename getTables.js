import sql from "mssql";
import { sqlConfig } from "./config.js";

export async function getTableSchema() {
  try {
    // Establish a connection to the database
    let pool = await sql.connect(sqlConfig);

    // Query to get all table names in the current database
    const schemaQuery = await pool
      .request()
      .query(
        "SELECT TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
      );

    const schemas = [];
    schemaQuery.recordset.forEach((res) => {
      schemas.push(res.TABLE_SCHEMA);
    });

    // Close the connection
    await pool.close();
    return schemas;
  } catch (err) {
    console.error("Error retrieving table names:", err.message);
  }
}
export async function getTableNames(namaSkema) {
  try {
    // Establish a connection to the database
    let pool = await sql.connect(sqlConfig);

    // Query to get all table names in the current database
    const result = await pool
      .request()
      .query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = '${namaSkema}'`
      );

    const tableNames = [];
    result.recordset.forEach((table) => {
      tableNames.push(table.TABLE_NAME);
    });

    // Close the connection
    await pool.close();
    return tableNames;
  } catch (err) {
    console.error("Error retrieving table names:", err.message);
  }
}
export async function getColumns(namaTable) {
  try {
    // Establish a connection to the database
    let pool = await sql.connect(sqlConfig);

    // Query to get all table names in the current database
    const result = await pool
      .request()
      .query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${namaTable}' ORDER BY ORDINAL_POSITION`
      );

    const columnNames = [];
    result.recordset.forEach((table) => {
      columnNames.push(table.COLUMN_NAME);
    });

    // Close the connection
    await pool.close();
    return columnNames;
  } catch (err) {
    console.error("Error retrieving table names:", err.message);
  }
}
