const proxy = require("http-proxy-middleware");
module.exports = app => {
    app.use(
        proxy("/.netlify/functions/server/", {
            target: "http://localhost:9000/",
        }),
    );
};
