import express from "express";

const app = express();
const router = express.Router();

const port: string = process.env.PORT || "3001";

app.set("port", port);
app.use("/.netlify/functions/server", router); // path must route to lambda
const server = app.listen(port, () => console.log("server start"));

app.get("/admin", (req, res) => {
    console.log(req);
    return res.send(200);
});

export { server, app };
