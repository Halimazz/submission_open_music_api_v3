import ExportsHandler from "./handler.js";
import routes from "./routes.js";

const exports = {
  name: "exports",
  version: "1.0.0",
  register: async (server, { service, validator, playlistsService }) => {
    const exportsHandler = new ExportsHandler(
      service,
      validator,
      playlistsService
    );
    server.route(routes(exportsHandler));
  },
};

export default exports;
