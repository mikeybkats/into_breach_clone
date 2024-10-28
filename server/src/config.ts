import { resolve } from "path";

export const config = {
  PORT: process.env.PORT || 3000,
  ROOT_DIR: resolve(__dirname, "../../"),
  isDev: process.env.NODE_ENV === "development",
};
