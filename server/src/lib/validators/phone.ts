import { z } from "zod";
import { LOCALE } from "../config/locale.js";

export const kenyanPhone = z
  .string()
  .min(9)
  .max(14)
  .regex(LOCALE.phoneRegex, "invalid Kenyan phone number");

export default kenyanPhone;
