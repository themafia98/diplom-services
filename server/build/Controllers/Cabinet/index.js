"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cabinet;
(function (Cabinet) {
    Cabinet.module = (app, route) => {
        if (!app)
            return null;
        route.get("/list", (req, res) => {
            res.sendStatus(200);
        });
    };
})(Cabinet || (Cabinet = {}));
exports.default = Cabinet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQ29udHJvbGxlcnMvQ2FiaW5ldC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLElBQVUsT0FBTyxDQVFoQjtBQVJELFdBQVUsT0FBTztJQUNBLGNBQU0sR0FBRyxDQUFDLEdBQWMsRUFBRSxLQUFtQixFQUFlLEVBQUU7UUFDdkUsSUFBSSxDQUFDLEdBQUc7WUFBRSxPQUFPLElBQUksQ0FBQztRQUV0QixLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUM1QixHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFBO0FBQ0wsQ0FBQyxFQVJTLE9BQU8sS0FBUCxPQUFPLFFBUWhCO0FBRUQsa0JBQWUsT0FBTyxDQUFDIn0=