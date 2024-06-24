import sql from "mssql";
import { sqlConfig } from "./config.js";

export async function generateSalesReport() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query(`
            SELECT ProductCategory.Name as Category, SUM(SalesOrderDetail.LineTotal) as TotalSales
            FROM Sales.SalesOrderDetail
            INNER JOIN Production.Product ON SalesOrderDetail.ProductID = Product.ProductID
            INNER JOIN Production.ProductSubcategory ON Product.ProductSubcategoryID = ProductSubcategory.ProductSubcategoryID
            INNER JOIN Production.ProductCategory ON ProductSubcategory.ProductCategoryID = ProductCategory.ProductCategoryID
            GROUP BY ProductCategory.Name
        `);

    console.log("Sales Report generated successfully:");

    console.log("=======================================");
    result.recordset.forEach((record) => {
      console.log(`${record.Category}: $${record.TotalSales.toFixed(2)}`);
    });
    console.log("=======================================");

    return result.recordset;
  } catch (error) {
    console.error("Error generating sales report:", error);
    throw error;
  }
}
