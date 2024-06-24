import jwt from "jsonwebtoken";
import { secretKey } from "./config.js";

export async function authenticateUser(username, password) {
  if (username === "admin" && password === "asdfasdf") {
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
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
