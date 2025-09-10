import Joi from "joi";
const currentYear = new Date().getFullYear();
const albumPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    "string.base": `Album "name" should be a type of 'text'`,
    "string.empty": `Album "name" cannot be an empty field`,
    "string.min": `Album "name" should have a minimum length of {#limit}`,
    "any.required": `Album "name" is a required field`,
  }),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(currentYear)
    .required()
    .messages({
      "number.base": "Year harus berupa angka",
      "number.min": "Year minimal 1900",
      "number.max": `Year maksimal ${currentYear}`,
      "any.required": "Year wajib diisi",
    }),
}).required();

export { albumPayloadSchema };
