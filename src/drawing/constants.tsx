const colors = ['black', 'red', 'blue', 'green'];
const strokes = [1, 2, 3, 4, 5, 6, 7, 8];

const MET_BASE_URL = `https://collectionapi.metmuseum.org/public/collection/v1/`;
const MET_SEARCH_URL = `${MET_BASE_URL}search?hasImages=true&q=`;
const MET_OBJECT_URL = `${MET_BASE_URL}objects/`;

export default {
  colors,
  strokes,
  MET_BASE_URL,
  MET_SEARCH_URL,
  MET_OBJECT_URL,
};

// logo original url: https://thenounproject.com/icon/graffiti-zone-6280/
