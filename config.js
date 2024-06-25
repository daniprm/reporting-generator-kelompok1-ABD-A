import sql from "mssql";
export const sqlConfig = {
  user: String,
  password: String,
  database: String,
  server: String,
  options: { encrypt: true, trustServerCertificate: true },
};
export async function getConfigData(user, password, database, server) {
  sqlConfig.user = `${user}`;
  sqlConfig.password = `${password}`;
  sqlConfig.database = `${database}`;
  sqlConfig.server = `${server}`;
  let isConnected = false;
  await sql.connect(sqlConfig).then((res) => (isConnected = res.connected));
  return isConnected;
}
export const secretKey = "abc123";
