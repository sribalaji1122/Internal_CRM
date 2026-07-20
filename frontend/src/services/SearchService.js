import api from './api';

const SearchService = {
  // GET /api/search?q=query
  globalSearch(query) {
    return api.get('/search', { params: { q: query } });
  }
};

export default SearchService;
