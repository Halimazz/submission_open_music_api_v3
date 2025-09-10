import InvariantError from "../../exceptions/InvariantError.js";
import ClientError from "../../exceptions/ClientError.js";

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // binding semua method dengan benar
    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongHandler = this.getSongHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      const payload = request.payload;

      this._validator.validateSongPayload(payload);

      const songId = await this._service.addMusic(payload);

    
      return h
        .response({
          status: "success",
          message: "Song successfully added",
          data: { songId },
        })
        .code(201);
    } catch (error) {
      if (error instanceof InvariantError || error instanceof ClientError) {
        return h
          .response({
            status: "fail",
            message: error.message,
          })
          .code(400);
      }

      console.error(error);
      return h
        .response({
          status: "error",
          message: "Maaf, terjadi kegagalan pada server kami.",
        })
        .code(500);
    }
  }

  async getSongHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this._service.getMusics({ title, performer });
    const response = h.response({
      status: "success",
      data: { songs },
    });
    return response;
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getMusicById(id);

      return {
        status: "success",
        data: { song },
      };
    } catch (error) {
      console.error("🔥 ERROR in getSongByIdHandler:", error);

      if (error.name === "NotFoundError") {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(404);
        return response;
      }

      if (error.name === "InvariantError" || error.name === "ClientError") {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode || 400);
        return response;
      }

      // default: error server
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      return response;
    }
  }

  async putSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      const { title, year, performer, genre, duration, albumId } =
        request.payload;
      const response = h.response({
        status: "success",
        message: "Song successfully updated",
      });

      await this._service.editMusicById(id, {
        title,
        year,
        performer,
        genre,
        duration,
        albumId,
      });

      return response;
    } catch (error) {
      console.error("ERROR in putSongHandler:", error);
      if (error.name === "NotFoundError") {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(404);
        return response;
      }
      if (error.name === "InvariantError" || error.name === "ClientError") {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode || 400);
        return response;
      }
    }
  }

  async deleteSongHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteMusicById(id);
      const response = h.response({
        status: "success",
        message: "Song successfully deleted",
      });
      return response;
    } catch (error) {
      console.error("ERROR in deleteSongHandler:", error);
      if (error.name === "NotFoundError") {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(404);
        return response;
      }
      if (error.name === "InvariantError" || error.name === "ClientError") {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode || 400);
        return response;
      }
    }
  }
}

export default SongsHandler;
