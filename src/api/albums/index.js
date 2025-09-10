import AlbumsHandler from "./handler.js";
import routes from "./routes.js";

const albums = {
  name: "albums",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const albumsHandler = new AlbumsHandler(service, validator);
    server.route(routes(albumsHandler));
  },
};

export default albums;
