const User = require('../../../src/models/user');
const app = require('../../../src/app');

describe('User Model', () => {
  it('Debe tener un schema', () => {
    expect(User.schema).toBeDefined();
  });
});