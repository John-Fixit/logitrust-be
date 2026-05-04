class BaseService {
  constructor(dao) {
    this.dao = dao;
  }

  list(filter = {}) {
    return this.dao.findAll(filter);
  }

  get(id) {
    return this.dao.findById(id);
  }

  create(payload) {
    return this.dao.create(payload);
  }

  update(id, payload) {
    return this.dao.updateById(id, payload);
  }

  remove(id) {
    return this.dao.deleteById(id);
  }
}

module.exports = BaseService;
