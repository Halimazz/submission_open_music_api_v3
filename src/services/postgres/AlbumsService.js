import { nanoid } from "nanoid";
import { Pool } from "pg";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import { mappingDBAlbumsToModel } from "../../utils/index.js";

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
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
  async postLikeAlbum(albumId, userId) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    await this.getAlbumById(albumId);

    const checkQuery = {
      text: "SELECT id FROM album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };

    const checkResult = await this._pool.query(checkQuery);
    if (checkResult.rows.length > 0) {
      throw new InvariantError("Album sudah disukai sebelumnya");
    }

    const query = {
      text: "INSERT INTO album_likes (id, user_id, album_id, created_at) VALUES($1, $2, $3, $4) RETURNING id",
      values: [id, userId, albumId, createdAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan like album");
    }

    // ✅ Safe cache deletion with null check
    await this._deleteLikesCache(albumId);

    return result.rows[0].id;
  }

  async getLikesCountByAlbumId(albumId) {
    const cacheKey = `album_likes:${albumId}`;

    try {
      // ✅ Check if cache service is available and try to get from cache
      if (this._cacheService) {
        const cachedLikes = await this._cacheService.get(cacheKey);
        return {
          count: parseInt(cachedLikes, 10),
          source: "cache",
        };
      }
    } catch (error) {
      // Cache miss or cache service unavailable, continue to database
    }

    // ✅ Get from database
    await this.getAlbumById(albumId);

    const query = {
      text: "SELECT COUNT(*) as count FROM album_likes WHERE album_id = $1",
      values: [albumId],
    };

    const result = await this._pool.query(query);
    const likesCount = parseInt(result.rows[0].count, 10);

    // ✅ Set cache if service is available
    if (this._cacheService) {
      try {
        await this._cacheService.set(cacheKey, likesCount.toString(), 1800);
      } catch (error) {
        console.error("Failed to set cache:", error.message);
      }
    }

    return {
      count: likesCount,
      source: "database",
    };
  }

  async deleteLikeAlbum(albumId, userId) {
    await this.getAlbumById(albumId);

    const query = {
      text: "DELETE FROM album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Like tidak ditemukan");
    }

    // ✅ Safe cache deletion
    await this._deleteLikesCache(albumId);

    return result.rows[0].id;
  }

  // ✅ Helper method untuk safe cache deletion
  async _deleteLikesCache(albumId) {
    if (!this._cacheService) {
      return; // Skip if cache service not available
    }

    const cacheKey = `album_likes:${albumId}`;
    try {
      await this._cacheService.delete(cacheKey);
    } catch (error) {
      console.error("Failed to delete cache:", error.message);
    }
  }
}

export default AlbumsService;
