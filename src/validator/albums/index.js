import { albumPayloadSchema } from "./schema.js";
import InvariantError from "../../exceptions/InvariantError.js";
const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const { error, value } = albumPayloadSchema.validate(payload);

    if (error) {
      // lempar error kalau payload tidak sesuai
      throw new InvariantError(error.message);
    }

    return value; // kembalikan payload yang sudah tervalidasi
  },
};
export default AlbumsValidator;
