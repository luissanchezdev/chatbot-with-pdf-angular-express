// /tests/unit/services/chat-service.test.js
const chatService = require('../../../src/services/chat-service');
const app = require('../../../src/app');

describe('Chat Service', () => {
  it('Debería tener la funcion sendMessage', () => {
    expect(chatService.sendMessage).toBeDefined();
  });
});