const ws = {
  startUrl: 'http://localhost:3001',
  socketIO: {
    path: '/socket.io',
    transports: ['websocket'],
    secure: false,
  },
};

export default ws;
