import Joi from "joi";
import InvariantError from "../../exceptions/InvariantError.js"; // pastikan path sesuai

const songPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required(),
  performer: Joi.string().required(),
  genre: Joi.string().required(),
  duration: Joi.number().integer().min(1).optional(),
  albumId: Joi.string().optional(),
}).required();

// fungsi validasi
function validateSongPayload(payload) {
  const { error } = songPayloadSchema.validate(payload, { abortEarly: false });
  if (error) {
    throw new InvariantError(error.message);
  }
}

export { songPayloadSchema, validateSongPayload };
