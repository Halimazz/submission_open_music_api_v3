import CollaborationsHandler from "./handler.js";
import routes from "./routes.js";

const collaborations = {
  name: "collaborations",
  version: "1.0.0",
  register: async (
    server,
    { service, playlistsService, usersService, validator }
  ) => {
    const collaborationsHandler = new CollaborationsHandler(
      service,
      playlistsService,
      usersService,
      validator
    );
    server.route(routes(collaborationsHandler));
  },
};

export default collaborations;
