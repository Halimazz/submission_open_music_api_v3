// Impor modul yang dibutuhkan
import { nanoid } from "nanoid";
import { Pool } from "pg";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import { mappingDBToModelDetail } from "../../utils/index.js";

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addMusic(song) {
    const id = "song-" + nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const query = {
      text: `INSERT INTO songs 
           (id, title, year, performer, genre, duration, album_id, inserted_at, updated_at) 
           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      values: [
        id,
        song.title,
        song.year,
        song.performer,
        song.genre,
        song.duration,
        song.albumId,
        insertedAt,
        updatedAt,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]?.id) {
      throw new InvariantError("Song failed to add");
    }

    return result.rows[0].id; // selalu return string (songId)
  }

  async getMusics({ title, performer } = {}) {
    let baseQuery = "SELECT id, title, performer FROM songs";
    const queryParams = [];
    const value = [];
    if (title) {
      value.push(`%${title}%`);
      queryParams.push(`title ILIKE $${queryParams.length + 1}`);
    }
    if (performer) {
      value.push(`%${performer}%`);
      queryParams.push(`performer ILIKE $${queryParams.length + 1}`);
    }
    if (queryParams.length) {
      baseQuery += ` WHERE ${queryParams.join(" AND ")}`;
    }
    const result = await this._pool.query({
      text: baseQuery,
      values: value,
    });
    return result.rows;
  }

  async getMusicById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Song not found");
    }

    return mappingDBToModelDetail(result.rows[0]);
  }

  async editMusicById(
    id,
    { title, year, performer, genre, duration, albumId }
  ) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: "UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id",
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Failed to update. Id not found");
    }

    return result.rows[0].id;
  }

  async deleteMusicById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Failed to delete. Id not found");
    }
    return result.rows[0].id;
  }
}

export default SongsService;
