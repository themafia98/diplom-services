const proxy = require("http-proxy-middleware");
module.exports = app => {
    app.use(
        proxy("asdsdasdasd/.netlify/functions/server/", {
            target: "adasdasdsadasdsahttp://localhost:9000/"
        })
    );
};
