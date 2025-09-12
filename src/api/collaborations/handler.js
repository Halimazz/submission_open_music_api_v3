import autoBind from "auto-bind";
import ClientError from "../../exceptions/ClientError.js";

class CollaborationsHandler {
  constructor(service, playlistsService, usersService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const playlistId = request.params.id || request.payload.playlistId;
      const { userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      if (!playlistId) {
        const response = h.response({
          status: "fail",
          message: "Gagal menambahkan kolaborasi, playlistId tidak ditemukan",
        });
        response.code(400);
        return response;
      }

      // ✅ Pastikan playlist ada dan ambil owner
      const playlist = await this._playlistsService.getPlaylistById(playlistId);

      if (!playlist) {
        const response = h.response({
          status: "fail",
          message: "Playlist tidak ditemukan",
        });
        response.code(404);
        return response;
      }

      // ✅ Pastikan hanya owner yang bisa menambahkan kolaborator
      if (playlist.owner !== credentialId) {
        const response = h.response({
          status: "fail",
          message: "Anda tidak berhak mengakses resource ini",
        });
        response.code(403);
        return response;
      }

      // ✅ Cegah owner menambahkan dirinya sendiri
      if (playlist.owner === userId) {
        const response = h.response({
          status: "fail",
          message:
            "Owner tidak bisa menambahkan dirinya sendiri sebagai kolaborator",
        });
        response.code(403);
        return response;
      }

      // ✅ Tambahkan kolaborasi
      const collaborationId =
        await this._collaborationsService.addCollaboration(playlistId, userId);

      const response = h.response({
        status: "success",
        message: "Kolaborasi berhasil ditambahkan",
        data: {
          collaborationId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      console.error(error);
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami",
      });
      response.code(500);
      return response;
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const playlistId = request.params.id || request.payload.playlistId;
      const { userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      if (!playlistId) {
        const response = h.response({
          status: "fail",
          message: "Gagal menghapus kolaborasi, playlistId tidak ditemukan",
        });
        response.code(400);
        return response;
      }

      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: "success",
        message: "Kolaborasi berhasil dihapus",
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: "Gagal menghapus kolaborasi",
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }
}

export default CollaborationsHandler;
