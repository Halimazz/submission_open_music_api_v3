import { nanoid } from "nanoid";
import { Pool } from "pg";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import AuthorizationError from "../../exceptions/AuthorizationError.js";

class CollaborationsService {
  constructor(playlistsService, usersService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
    this._usersService = usersService;
  }

  async addCollaboration(playlistId, userId) {
    await this._verifyUserExists(userId);

    const id = `collab-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlist_collaborations (id, playlist_id, user_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id",
      values: [id, playlistId, userId],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError("Kolaborasi gagal ditambahkan");
      }
      return result.rows[0].id;
    } catch (error) {
      if (error.code === "23505") {
        throw new InvariantError("Kolaborasi sudah ada");
      }
      throw error;
    }
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: "DELETE FROM playlist_collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Kolaborasi tidak ditemukan");
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: "SELECT * FROM playlist_collaborations WHERE playlist_id = $1 AND user_id = $2",
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }
}

export default CollaborationsService;
