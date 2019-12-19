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
        route.get("/auth", (req, res, next) => {
            console.log("/auth");
            if (req.isAuthenticated()) {
                res.sendStatus(200);
            }
            else {
                res.sendStatus(404);
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
                    return res.json({ user: user.toAuthJSON() });
                }
            })(req, res, next);
        });
        route.get("/logout", (req, res) => {
            req.logout();
            res.redirect("/");
        });
    };
})(General || (General = {}));
exports.default = General;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVycy9HZW5lcmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0Esb0RBQXVCO0FBQ3ZCLHdEQUFnQztBQUNoQyxvREFBNEI7QUFDNUIsc0RBQXNEO0FBRXRELDBEQUFrQztBQUdsQyxJQUFVLE9BQU8sQ0E0RGhCO0FBNURELFdBQVUsT0FBTztJQUNiLE1BQU0sTUFBTSxHQUFHLGdCQUFNLEVBQUUsQ0FBQyxDQUFDLFlBQVk7SUFDeEIsY0FBTSxHQUFHLENBQUMsR0FBUSxFQUFFLEtBQW1CLEVBQWUsRUFBRTtRQUNqRSxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRXRCLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQixFQUFFLEVBQUU7WUFDbkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQixJQUFVLEdBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRTtnQkFDOUIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN2QjtpQkFBTTtnQkFDSCxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3ZCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsSUFBSSxDQUNOLE1BQU0sRUFDTixNQUFNLENBQUMsR0FBRyxFQUFFLEVBQ1osS0FBSyxFQUFFLEdBQVksRUFBRSxHQUFhLEVBQWlCLEVBQUU7WUFDakQsSUFBSTtnQkFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLGdCQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ3pGLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN2QixNQUFNLGtCQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFVLEVBQUUsRUFBRTt3QkFDdEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDakIsSUFBSSxHQUFHOzRCQUFFLE9BQU8sS0FBSyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUN6QyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBQy9CLE9BQU8sS0FBSyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQzthQUNOO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDbkM7UUFDTCxDQUFDLENBQ0osQ0FBQztRQUVGLEtBQUssQ0FBQyxJQUFJLENBQ04sUUFBUSxFQUFFLGNBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQUksRUFBZ0IsRUFBRTtZQUN0RixNQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQztZQUMxQixJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQUUsT0FBTyxLQUFLLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEUsT0FBTyxNQUFNLGtCQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxVQUFVLEdBQVUsRUFBRSxJQUFTO2dCQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNQLE9BQU8sS0FBSyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNuQztxQkFBTTtvQkFFSCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDaEMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ2hEO1lBQ0wsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQ0osQ0FBQztRQUVGLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxFQUFFO1lBQzNDLEdBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLEdBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFN0IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7QUFDTixDQUFDLEVBNURTLE9BQU8sS0FBUCxPQUFPLFFBNERoQjtBQUVELGtCQUFlLE9BQU8sQ0FBQyJ9