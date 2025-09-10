import { playListSongLoadSchema } from "./schema.js";
import InvariantError from "../../exceptions/InvariantError.js";

const PlaylistSongValidator = {
    validatePlaylistSongPayload: (payload) => {
    const validationResult = playListSongLoadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default PlaylistSongValidator;