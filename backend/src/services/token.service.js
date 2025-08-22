import crypto from "crypto";

export const generateActivationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};