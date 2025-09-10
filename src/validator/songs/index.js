import { songPayloadSchema } from "./schema.js";
import InvariantError from "../../exceptions/InvariantError.js";

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = songPayloadSchema.validate(payload);
    if (validationResult.error) {
      // Menggabungkan semua pesan error Joi menjadi satu string
      const errorMessage = validationResult.error.details
        .map((detail) => detail.message)
        .join(". ");
      throw new InvariantError(errorMessage);
    }
  },
};

export default SongsValidator;
