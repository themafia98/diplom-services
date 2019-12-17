"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const passport_1 = __importDefault(require("passport"));
const multer_1 = __importDefault(require("multer"));
const Schema_1 = require("../Models/Database/Schema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var General;
(function (General) {
    const upload = multer_1.default(); // form-data
    General.module = (app, route) => {
        if (!app)
            return null;
        route.use("/api", async (req, res, next) => {
            try {
                await passport_1.default.authenticate("jwt", (err, user) => {
                    if (err || !user) {
                        if (req.session) {
                            req.session.destroy(function () {
                                res.clearCookie("jwtsecret");
                                res.redirect("/");
                            });
                        }
                        else
                            res.redirect("/");
                    }
                    else
                        next();
                });
            }
            catch (err) {
                if (req.session) {
                    req.session.destroy(function () {
                        res.clearCookie("jwtsecret");
                        res.redirect("/");
                    });
                }
                else
                    res.redirect("/");
            }
        });
        route.post("/reg", upload.any(), async (req, res) => {
            try {
                console.log(req.body);
                if (!req.body || (req.body && lodash_1.default.isEmpty(req.body)))
                    throw new Error("Invalid auth data");
                const service = app.locals;
                service.dbm.connection().then(async () => {
                    console.log("connect");
                    await Schema_1.UserModel.create({ ...req.body, accept: true, rules: "full" }, async (err) => {
                        console.log(err);
                        if (err)
                            return void res.sendStatus(400);
                        await service.dbm.disconnect();
                        return void res.sendStatus(200);
                    });
                });
            }
            catch (err) {
                return void res.sendStatus(400);
            }
        });
        route.post("/login", async (req, res) => {
            try {
                if (!req.body)
                    throw new Error("Invalid auth data");
                await passport_1.default.authenticate("local", function (err, user) {
                    const payload = {
                        id: user.id,
                        email: user.email,
                        displayName: user.displayName
                    };
                    const token = jsonwebtoken_1.default.sign(payload, "jwtsecret");
                    res.json({ user: user.displayName, token: "JWT " + token });
                })(req.body);
            }
            catch (err) {
                res.status(400).json(err);
            }
        });
        route.get("/logout", (req, res) => {
            if (req.session) {
                req.session.destroy(function () {
                    res.clearCookie("jwtsecret");
                    res.redirect("/");
                });
            }
            else
                res.redirect("/");
        });
    };
})(General || (General = {}));
exports.default = General;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVycy9HZW5lcmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0Esb0RBQXVCO0FBQ3ZCLHdEQUFnQztBQUNoQyxvREFBNEI7QUFDNUIsc0RBQXNEO0FBRXRELGdFQUErQjtBQUUvQixJQUFVLE9BQU8sQ0FnRmhCO0FBaEZELFdBQVUsT0FBTztJQUNiLE1BQU0sTUFBTSxHQUFHLGdCQUFNLEVBQUUsQ0FBQyxDQUFDLFlBQVk7SUFDeEIsY0FBTSxHQUFHLENBQUMsR0FBUSxFQUFFLEtBQW1CLEVBQWUsRUFBRTtRQUNqRSxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRXRCLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWMsRUFBRSxFQUFFO1lBQ3BFLElBQUk7Z0JBQ0EsTUFBTSxrQkFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFVLEVBQUUsSUFBUyxFQUFFLEVBQUU7b0JBQ3pELElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNkLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRTs0QkFDYixHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQ0FDaEIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQ0FDN0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDdEIsQ0FBQyxDQUFDLENBQUM7eUJBQ047OzRCQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQzVCOzt3QkFBTSxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7YUFDTjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNWLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRTtvQkFDYixHQUFH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