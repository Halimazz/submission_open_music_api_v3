const mappingDBSongsToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mappingDBToModelDetail = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});
const mappingDBAlbumsToModel = ({ id, name, year }) => ({
  id,
  name,
  year,
});
// module.exports = { mappingDBToModelDetail };
export {
  mappingDBToModelDetail,
  mappingDBSongsToModel,
  mappingDBAlbumsToModel,
};
