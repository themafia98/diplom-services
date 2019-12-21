"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const passport_1 = __importDefault(require("passport"));
const multer_1 = __importDefault(require("multer"));
const Schema_1 = require("../Models/Database/Schema");
const Auth_1 = __importDefault(require("../Models/Auth"));
var General;
(function (General) {
    const upload = multer_1.default(); // form-data
    General.module = (app, route) => {
        if (!app)
            return null;
        const isPrivateRoute = (req, res, next) => {
            if (req.isAuthenticated()) {
                console.log("Session");
                return void next();
            }
            else
                return void res.redirect("/");
        };
        route.get("/auth", isPrivateRoute, (req, res, next) => {
            console.log("/auth");
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
        route.post("/login", Auth_1.default.config.optional, async (req, res, next) => {
            const { body = {} } = req;
            if (!body || body && lodash_1.default.isEmpty(body))
                return void res.sendStatus(503);
            return await passport_1.default.authenticate('local', function (err, user) {
                console.log(user);
                if (!user) {
                    return void res.sendStatus(401);
                }
                else {
                    user.token = user.generateJWT();
                    req.login(user, (err) => {
                        if (err) {
                            return next(err);
                        }
                        return res.json({ user: user.toAuthJSON() });
                    });
                }
            })(req, res, next);
        });
        route.post("/logout", isPrivateRoute, (req, res, next) => {
            console.log(res);
            req.logOut();
            res.clearCookie("sid");
            return res.redirect("/");
        });
    };
})(General || (General = {}));
exports.default = General;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVycy9HZW5lcmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0Esb0RBQXVCO0FBQ3ZCLHdEQUFnQztBQUNoQyxvREFBNEI7QUFDNUIsc0RBQXNEO0FBRXRELDBEQUFrQztBQUdsQyxJQUFVLE9BQU8sQ0FvRWhCO0FBcEVELFdBQVUsT0FBTztJQUNiLE1BQU0sTUFBTSxHQUFHLGdCQUFNLEVBQUUsQ0FBQyxDQUFDLFlBQVk7SUFDeEIsY0FBTSxHQUFHLENBQUMsR0FBUSxFQUFFLEtBQW1CLEVBQWUsRUFBRTtRQUNqRSxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRXRCLE1BQU0sY0FBYyxHQUFHLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQixFQUFFLEVBQUU7WUFDdkUsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3ZCLE9BQU8sS0FBSyxJQUFJLEVBQUUsQ0FBQzthQUN0Qjs7Z0JBQ0ksT0FBTyxLQUFLLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsQ0FBQyxDQUFDO1FBRUYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQixFQUFFLEVBQUU7WUFDbkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxJQUFJLENBQ04sTUFBTSxFQUNOLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFDWixLQUFLLEVBQUUsR0FBWSxFQUFFLEdBQWEsRUFBaUIsRUFBRTtZQUNqRCxJQUFJO2dCQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElB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