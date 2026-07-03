import { z } from "zod";

const KENYA_PHONE_REGEX = /^(?:\+254|0)[17]\d{8}$/;

export const kenyanPhone = z
  .string()
  .min(9)
  .max(14)
  .regex(KENYA_PHONE_REGEX, "invalid Kenyan phone number");

export default kenyanPhone;
