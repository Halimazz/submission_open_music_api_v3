import path from "path";
const routes = (handler) => [
  {
    method: "POST",
    path: "/upload/images",
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
      },
    },
  },
  {
    method: "GET",
    path: "/upload/{param*}",
    handler: {
      directory: {
        path: path.resolve(process.cwd(), "file"),
      },
    },
  },
];

export default routes;
