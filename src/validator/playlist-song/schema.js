import Joi from "joi";

const playListSongLoadSchema = Joi.object({
    songId: Joi.string().required(),
});

export { playListSongLoadSchema };