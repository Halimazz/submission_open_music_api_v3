import ClientError from "./ClientError.js";

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = "AuthorizationError";
  }
}

export default AuthenticationError;
