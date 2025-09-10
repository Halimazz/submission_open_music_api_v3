import SongsHandlers from "./handler.js";
import routes from "./routes.js";

const songs = {
  name: "songs",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const songHandlers = new SongsHandlers(service, validator);
    server.route(routes(songHandlers));
  },
};

export default songs;
