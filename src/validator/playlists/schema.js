import Joi from "joi";

const playlistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

export { playlistPayloadSchema };