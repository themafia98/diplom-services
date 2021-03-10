const ws = {
  startUrl: '/',
  socketIO: {
    path: '/socket.io',
    transports: ['websocket'],
    secure: window.location.protocol === 'https',
  },
};

export default ws;
