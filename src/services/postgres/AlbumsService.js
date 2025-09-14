import { nanoid } from "nanoid";
import { Pool } from "pg";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import { mappingDBAlbumsToModel } from "../../utils/index.js";

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }
  async addAlbum({ name, year }) {
    const id = "album-" + nanoid(16);
    const query = {
      text: "INSERT INTO albums (id, name, year) VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album failed to add");
    }

    return result.rows[0].id;
  }
  async getAlbums() {
    const result = await this._pool.query("SELECT id, name, year FROM albums");
    return result.rows.map(mappingDBAlbumsToModel);
  }
  async getAlbumById(id) {
    // Ambil data album
    const queryAlbum = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };
    const resultAlbum = await this._pool.query(queryAlbum);

    if (!resultAlbum.rows.length) {
      throw new NotFoundError("Album not found");
    }

    const album = mappingDBAlbumsToModel(resultAlbum.rows[0]);

    // Ambil daftar lagu yang punya album_id sesuai
    const querySongs = {
      text: "SELECT id, title, performer FROM songs WHERE album_id = $1",
      values: [id],
    };
    const resultSongs = await this._pool.query(querySongs);

    // Tambahkan daftar lagu ke object album
    album.songs = resultSongs.rows;

    return album;
  }
  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Failed to update. Album not found");
    }
  }
  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Failed to delete. Album not found");
    }
  }
  async editAlbumCoverById(id, coverUrl) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: "UPDATE albums SET cover_url = $1, updated_at = $2 WHERE id = $3 RETURNING id",
      values: [coverUrl, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(
        "Gagal memperbarui cover album. Id tidak ditemukan"
      );
    }
  }
  async editAlbumCoverById(id, coverUrl) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: "UPDATE albums SET cover_url = $1, updated_at = $2 WHERE id = $3 RETURNING id",
      values: [coverUrl, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(
        "Gagal memperbarui cover album. Id tidak ditemukan"
      );
    }
  }
}

export default AlbumsService;
