import "dotenv/config";
import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import Jwt from "@hapi/jwt";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

// songs
import songs from "./api/songs/index.js";
import SongsService from "./services/postgres/SongsService.js";
import SongsValidator from "./validator/songs/index.js";

// albums
import albums from "./api/albums/index.js";
import AlbumsService from "./services/postgres/AlbumsService.js";
import AlbumsValidator from "./validator/albums/index.js";

//users
import users from "./api/users/index.js";
import UsersService from "./services/postgres/UsersService.js";
import UsersValidator from "./validator/users/index.js";

//Authentications
import authentications from "./api/authentications/index.js";
import AuthenticationsService from "./services/postgres/AuthenticationsService.js";
import TokenManager from "./tokenize/TokenManager.js";
import AuthenticationsValidator from "./validator/authentications/index.js";
// Playlists
import playlists from "./api/playlists/index.js";
import PlaylistsService from "./services/postgres/PlaylistsService.js";
import PlaylistsValidator from "./validator/playlists/index.js";
import PlaylistSongsValidator from "./validator/playlist-song/index.js";
// Collaborations
import collaborations from "./api/collaborations/index.js";
import CollaborationsService from "./services/postgres/CollaborationsService.js";
import CollaborationsValidator from "./validator/collaborations/index.js";
//exports
import _exports from "./api/exports/index.js";
import ProducerService from "./services/rabbitmq/ProducerService.js";
import ExportValidator from "./validator/exports/index.js";

//uploads
import uploads from "./api/uploads/index.js";
import StorageService from "./services/storage/StorageService.js";
import UploadsValidator from "./validator/uploads/index.js";

const { PORT, HOST } = process.env;

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const collaborationsService = new CollaborationsService(usersService);
  const playlistsService = new PlaylistsService(collaborationsService);
  const authenticationsService = new AuthenticationsService();
  const storageService = new StorageService(
    path.resolve(process.cwd(), "src/api/uploads/file/images")
  );
  const server = Hapi.server({
    port: PORT,
    host: HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);
  // define strategy
  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  server.ext("onPreResponse", (request, h) => {
    const response = request.response;

    if (!(response instanceof Error)) {
      return h.continue;
    }

    // Kalau error dari Hapi (Boom error)
    if (response.isBoom) {
      const { statusCode, payload } = response.output;

      // Biar respons selalu konsisten
      return h
        .response({
          status: statusCode >= 500 ? "error" : "fail",
          message: payload.message,
        })
        .code(statusCode);
    }

    // Fallback (kalau ada error lain yang ga ketangkap)
    return h
      .response({
        status: "error",
        message: "Terjadi kegagalan pada server.",
      })
      .code(500);
  });

  try {
    await server.register([
      //start plugin eksternal
      {
        plugin: songs,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
      {
        plugin: albums,
        options: {
          service: albumsService,
          validator: AlbumsValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
      {
        plugin: authentications,
        options: {
          authenticationsService,
          usersService,
          TokenManager,
          validator: AuthenticationsValidator,
        },
      },
      {
        plugin: playlists,
        options: {
          service: playlistsService,
          validator: PlaylistsValidator,
          playlistSongsValidator: PlaylistSongsValidator,
        },
      },
      {
        plugin: collaborations,
        options: {
          service: collaborationsService,
          playlistsService, // dipakai untuk verify owner
          validator: CollaborationsValidator,
        },
      },
      {
        plugin: _exports,
        options: {
          service: ProducerService,
          validator: ExportValidator,
        },
      },
      {
        plugin: uploads,
        options: {
          service: storageService,
          validator: UploadsValidator,
        },
      },

      //end plugin eksternal (jangan tambahkan kode dibawah komentar ini)
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
  } catch (err) {
    console.error(`Gagal memulai server: ${err.message}`);
    process.exit(1);
  }
};

init();
