export const DB_NAME = "mukul_1203";

export const accessOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day
};

export const refreshOptions = {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days
};