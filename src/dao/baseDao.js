class BaseDao {
  constructor(model, defaultInclude = []) {
    this.model = model;
    this.defaultInclude = defaultInclude;
  }

  create(payload) {
    return this.model.create(payload);
  }

  findById(id) {
    return this.model.findByPk(id, { include: this.defaultInclude });
  }

  findAll(filter = {}) {
    return this.model.findAll({ where: filter, include: this.defaultInclude });
  }

  async updateById(id, payload) {
    const row = await this.model.findByPk(id);
    if (!row) return null;
    await row.update(payload);
    return row;
  }

  async deleteById(id) {
    const row = await this.model.findByPk(id);
    if (!row) return 0;
    await row.destroy();
    return 1;
  }
}

module.exports = BaseDao;
