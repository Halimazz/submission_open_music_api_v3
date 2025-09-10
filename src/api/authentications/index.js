import AuthenticationsHandler from "./handler.js";
import routes from "./routes.js";

const authentications = {
  name: "authentications",
  version: "1.0.0",
  register: async (
    server,
    { authenticationsService, usersService, TokenManager, validator }
  ) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      TokenManager,
      validator
    );
    server.route(routes(authenticationsHandler));
  },
};

export default authentications;
