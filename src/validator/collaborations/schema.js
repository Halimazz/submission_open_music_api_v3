import Joi from "joi";

const collaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});
export { collaborationPayloadSchema };