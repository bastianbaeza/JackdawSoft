"use strict";

import "dotenv/config";

export const HOST = process.env.HOST || process.env.DB_HOST || "localhost";
export const DB_USERNAME = process.env.DB_USERNAME || process.env.DB_USER || "postgres";
export const PASSWORD = process.env.PASSWORD || process.env.DB_PASSWORD || "password";
export const DATABASE = process.env.DATABASE || process.env.DB_NAME || "jackdaws_db";
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || "your-super-secret-jwt-key-change-in-production";
export const cookieKey = process.env.cookieKey;
export const CORREO = process.env.CORREO;
export const CONTRASENA = process.env.CONTRASENA;
export const NODE_ENV = process.env.NODE_ENV || "development";