export const DB_NAME = "mukul_1203";

export const accessOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 1 * 24 * 60 * 60 * 1000,
};

export const refreshOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 10 * 24 * 60 * 60 * 1000,
};