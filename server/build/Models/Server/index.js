"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const lodash_1 = __importDefault(require("lodash"));
const helmet_1 = __importDefault(require("helmet"));
const chalk_1 = __importDefault(require("chalk"));
const Router_1 = __importDefault(require("../Router"));
const General_1 = __importDefault(require("../../Controllers/General"));
const Tasks_1 = __importDefault(require("../../Controllers/Tasks"));
const Database_1 = __importDefault(require("../Database"));
const Security_1 = __importDefault(require("../Security"));
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
        this.getApp().use(express_session_1.default({ secret: "jwtsecret", saveUninitialized: false, resave: false }));
        this.getApp().use(passport_1.default.session());
        passport_1.default.use(new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
            session: true
        }, (email, password, done) => {
            Schema_1.UserModel.findOne({ email }, (err, user) => {
                if (err)
                    return done(err);
                else if (!user || !user.checkPassword(password)) {
                    return done(null, false, { message: "Нет такого пользователя или пароль неверен." });
                }
                return done(null, user);
            });
        }));
        const jwtOptions = {
            jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
            secretOrKey: "jwtsecret"
        };
        passport_1.default.use(new jwt.Strategy(jwtOptions, function (payload, done) {
            console.log(payload);
            Schema_1.UserModel.findOne(payload.id, (err, user) => {
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
        passport_1.default.deserializeUser(function (id, done) {
            Schema_1.UserModel.findById(id, function (err, user) {
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
        this.getApp().locals.hash = new Security_1.default.Crypto();
        this.getApp().locals.dbm = new Database_1.default.ManagmentDatabase("controllSystem", process.env.MONGODB_URI);
        const tasksRoute = instanceRouter.createRoute("/tasks");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1NlcnZlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUF3RjtBQUN4RixzRUFBc0M7QUFDdEMsd0RBQWdDO0FBQ2hDLG9EQUF1QjtBQUN2QixvREFBNEI7QUFDNUIsa0RBQTBCO0FBRTFCLHVEQUF1QztBQUl2Qyx3RUFBZ0Q7QUFDaEQsb0VBQTRDO0FBQzVDLDJEQUFtQztBQUNuQywyREFBbUM7QUFDbkMsK0NBQStDO0FBRS9DLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUVoRCxNQUFNLFlBQVk7SUFJZCxZQUFZLElBQVk7UUFGaEIsZ0JBQVcsR0FBdUIsSUFBSSxDQUFDO1FBRzNDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFTSxPQUFPO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBb0IsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN6QyxDQUFDO0lBRU0sTUFBTSxDQUFDLE9BQW9CO1FBQzlCLElBQUksZ0JBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0lBQy9ELENBQUM7SUFFTSxhQUFhLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQjtRQUMxRCxHQUFJLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDOUIsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDO0lBRU0sS0FBSztRQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQU8sRUFBRSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sRUFB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