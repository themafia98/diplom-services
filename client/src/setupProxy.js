// @ts-nocheck
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
  app.use(
    '/rest',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      secure: false,
      changeOrigin: true,
      ws: true, // proxy websockets
      onClose: function onClose(res, socket, head) {
        // view disconnected websocket connectionsZ
        console.log('Client disconnected');
      },
    }),
  );
};
