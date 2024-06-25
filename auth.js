import jwt from "jsonwebtoken";
import { secretKey, getConfigData } from "./config.js";

export async function authenticateUser(user, password, database, server) {
  if (getConfigData(user, password, database, server)) {
    const token = jwt.sign({ user }, secretKey, { expiresIn: "1h" });
    return token;
  }
  throw new Error("Username or password is incorrect");
}

export function authorize(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    throw new Error("Unauthorized");
  }
}
