class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;

      const albumId = await this._service.addAlbum({ name, year });

      const response = h.response({
        status: "success",
        message: "Album berhasil ditambahkan",
        data: { albumId },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(400);
      return response;
    }
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: "success",
      data: { albums },
    };
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);

      return {
        status: "success",
        data: { album },
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(404);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload); // <-- kalau error, akan throw
      const { id } = request.params;
      const { name, year } = request.payload;

      await this._service.editAlbumById(id, { name, year });

      return {
        status: "success",
        message: "Album berhasil diperbarui",
      };
    } catch (error) {
      // kalau error validasi (InvariantError), kasih 400
      if (error.name === "InvariantError") {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(400);
        return response;
      }

      // kalau error karena id tidak ditemukan, kasih 404
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(404);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);

      return {
        status: "success",
        message: "Album berhasil dihapus",
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(404);
      return response;
    }
  }
  async postAlbumLikesHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._albumsService.postLikeAlbum(albumId, userId);

      const response = h.response({
        status: "success",
        message: "Berhasil menambahkan like pada album",
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async getAlbumLikesHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const likesData = await this._albumsService.getLikesCountByAlbumId(
        albumId
      );

      const response = h.response({
        status: "success",
        data: {
          likes: likesData.count || likesData, // Handle both object and number response
        },
      });

      // ✅ Set X-Data-Source header based on data source
      if (likesData.source === "cache") {
        response.header("X-Data-Source", "cache");
      }

      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async deleteAlbumLikesHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._albumsService.deleteLikeAlbum(albumId, userId);

      const response = h.response({
        status: "success",
        message: "Berhasil membatalkan like pada album",
      });
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }
}

export default AlbumsHandler;
