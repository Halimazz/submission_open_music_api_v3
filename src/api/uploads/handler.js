import ClientError from "../../exceptions/ClientError.js";

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    try {
      const { data } = request.payload;

      // validasi header image
      this._validator.validateImageHeaders(data.hapi.headers);

      // simpan file ke storage
      const filename = await this._service.writeFile(data, data.hapi);

      // balikin response sukses
      const response = h.response({
        status: "success",
        data: {
          fileLocation: `http://${process.env.HOST}:${process.env.PORT}/uploads/file/images/${filename}`,
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

      // error tak terduga
      console.error(error);
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      return response;
    }
  }
}

export default UploadsHandler;
