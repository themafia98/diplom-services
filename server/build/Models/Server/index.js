"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const passport_1 = __importDefault(require("passport"));
const lodash_1 = __importDefault(require("lodash"));
const helmet_1 = __importDefault(require("helmet"));
const chalk_1 = __importDefault(require("chalk"));
const Router_1 = __importDefault(require("../Router"));
const General_1 = __importDefault(require("../../Controllers/General"));
const Tasks_1 = __importDefault(require("../../Controllers/Tasks"));
const Database_1 = __importDefault(require("../Database"));
const Schema_1 = require("../Database/Schema");
const jwt = require("passport-jwt");
const LocalStrategy = require("passport-local");
class ServerRunner {
    constructor(port) {
        this.application = null;
        this.port = port;
    }
    getPort() {
        return this.port;
    }
    getApp() {
        return this.application;
    }
    setApp(express) {
        if (lodash_1.default.isNull(this.application))
            this.application = express;
    }
    startResponse(req, res, next) {
        req.start = new Date();
        next();
    }
    start() {
        this.setApp(express_1.default());
        this.getApp().use(passport_1.default.initialize());
        this.getApp().disabled("x-powerd-by");
        this.getApp().use(helmet_1.default());
        this.getApp().use(express_1.default.urlencoded({ extended: true }));
        this.getApp().use(express_1.default.json());
        this.getApp().set("port", this.getPort());
        this.getApp().use(express_session_1.default({
            secret: "jwtsecret",
            saveUninitialized: true,
            resave: true,
            store: new connect_mongo_1.default({
                url: process.env.MONGODB_URI,
                collection: 'sessions'
            })
        }));
        this.getApp().use(passport_1.default.session());
        const dbm = new Database_1.default.ManagmentDatabase("controllSystem", process.env.MONGODB_URI);
        this.getApp().locals.dbm = dbm;
        passport_1.default.use(new LocalStrategy({
            usernameField: "email",
            passwordField: "password"
        }, async (email, password, done) => {
            console.log(password);
            await dbm.connection();
            Schema_1.UserModel.findOne({ email }, async (err, user) => {
                await dbm.disconnect();
                if (err)
                    return done(err);
                else if (!user || !user.checkPassword(password)) {
                    return done(null, false, {
                        message: "Нет такого пользователя или пароль неверен."
                    });
                }
                else {
                    return done(null, user);
                }
            });
        }));
        const jwtOptions = {
            jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
            secretOrKey: "jwtsecret"
        };
        passport_1.default.use(new jwt.Strategy(jwtOptions, async function (payload, done) {
            await dbm.connection();
            console.log("jwt");
            Schema_1.UserModel.findOne(payload.id, async (err, user) => {
                await dbm.disconnect();
                if (err) {
                    return done(err);
                }
                if (user) {
                    done(null, user);
                }
                else {
                    done(null, false);
                }
            });
        }));
        passport_1.default.serializeUser(function (user, done) {
            done(null, user.id);
        });
        passport_1.default.deserializeUser(async function (id, done) {
            console.log(id);
            await dbm.connection();
            Schema_1.UserModel.findById(id, async function (err, user) {
                await dbm.disconnect();
                done(err, user);
            });
        });
        const instanceRouter = Router_1.default.Router.instance(this.getApp());
        const server = this.getApp().listen(this.getPort(), () => {
            console.log(`${chalk_1.default.yellow(`Worker ${process.pid}`)} ${chalk_1.default.green("started")}`);
            console.log(`Server or worker listen on ${chalk_1.default.blue.bold(this.port)}.`);
        });
        /** initial entrypoint route */
        const rest = instanceRouter.initInstance("/rest");
        const tasksRoute = instanceRouter.createRoute("/api/tasks");
        General_1.default.module(this.getApp(), rest);
        tasksRoute.use(this.startResponse);
        Tasks_1.default.module(this.getApp(), tasksRoute);
        process.on("SIGTERM", () => {
            console.log("SIGTERM, uptime:", process.uptime());
            server.close();
        });
    }
}
exports.default = ServerRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1NlcnZlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUF3RjtBQUN4RixzRUFBMEQ7QUFDMUQsa0VBQXVDO0FBQ3ZDLHdEQUFnQztBQUNoQyxvREFBdUI7QUFDdkIsb0RBQTRCO0FBQzVCLGtEQUEwQjtBQUUxQix1REFBdUM7QUFJdkMsd0VBQWdEO0FBQ2hELG9FQUE0QztBQUM1QywyREFBbUM7QUFFbkMsK0NBQStDO0FBRS9DLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUVoRCxNQUFNLFlBQVk7SUFJZCxZQUFZLElBQVk7UUFGaEIsZ0JBQVcsR0FBdUIsSUFBSSxDQUFDO1FBRzNDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFTSxPQUFPO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBb0IsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN6QyxDQUFDO0lBRU0sTUFBTSxDQUFDLE9BQW9CO1FBQzlCLElBQUksZ0JBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0lBQy9ELENBQUM7SUFFTSxhQUFhLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQjtRQUMxRCxHQUFJLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDOUIsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDO0lBRU0sS0FBSztRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQU8sRUFBRSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxrQkFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLGdCQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsaUJBQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMseUJBQU8sQ0FBQztZQUN0QixNQUFNLEVBQUUsV0FBVztZQUNuQixpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLE1BQU0sRUFBRSxJQUFJO1lBQ1osS0FBSyxFQUFFLElBQUksdUJBQVUsQ0FBQztnQkFDbEIsR0FBRyxFQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVztnQkFDakMsVUFBVSxFQUFFLFVBQVU7YUFDekIsQ0FBQztTQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0osSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxrQkFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFdEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBUSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixFQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUYsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBRS9CLGtCQUFRLENBQUMsR0FBRyxDQUNSLElBQUksYUFBYSxDQUNiO1lBQ0ksYUFBYSxFQUFFLE9BQU87WUFDdEIsYUFBYSxFQUFFLFVBQVU7U0FDNUIsRUFDRCxLQUFLLEVBQUUsS0FBYSxFQUFFLFFBQWdCLEVBQUUsSUFBYyxFQUFFLEVBQUU7WUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QixNQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN2QixrQkFBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFVLEVBQUUsSUFBUyxFQUFFLEVBQUU7Z0JBRXpELE1BQU0sR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN2QixJQUFJLEdBQUc7b0JBQUUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBRXJCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUM3QyxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO3dCQUNyQixPQUFPLEVBQUUsNkNBQTZDO3FCQUN6RCxDQUFDLENBQUM7aUJBQ047cUJBQU07b0JBRUgsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUMzQjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUNKLENBQ0osQ0FBQztRQUVGLE1BQU0sVUFBVSxHQUFHO1lBQ2YsY0FBYyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDO1lBQzlELFdBQVcsRUFBRSxXQUFXO1NBQzNCLENBQUM7UUFFRixrQkFBUSxDQUFDLEdBQUcsQ0FDUixJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEtBQUssV0FBVyxPQUFZLEVBQUUsSUFBYztZQUNyRSxNQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLGtCQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQVUsRUFBRSxJQUFTLEVBQUUsRUFBRTtnQkFDMUQsTUFBTSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBRXZCLElBQUksR0FBRyxFQUFFO29CQUNMLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNwQjtnQkFDRCxJQUFJLElBQUksRUFBRTtvQkFDTixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNwQjtxQkFBTTtvQkFDSCxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNyQjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQ0wsQ0FBQztRQUVGLGtCQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsSUFBUyxFQUFFLElBQUk7WUFDNUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxrQkFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLFdBQVcsRUFBRSxFQUFFLElBQUk7WUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoQixNQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN2QixrQkFBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxXQUFXLEdBQUcsRUFBRSxJQUFTO2dCQUNqRCxNQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxjQUFjLEdBQVUsZ0JBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLE1BQU0sTUFBTSxHQUFlLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQVMsRUFBRTtZQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLGVBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLGVBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0UsQ0FBQyxDQUFDLENBQUM7UUFFSCwrQkFBK0I7UUFDL0IsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxNQUFNLFVBQVUsR0FBVyxjQUFjLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXBFLGlCQUFPLENBQUMsTUFBTSxDQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6QyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVuQyxlQUFLLENBQUMsTUFBTSxDQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUU3QyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFTLEVBQUU7WUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFFRCxrQkFBZSxZQUFZLENBQUMifQ==