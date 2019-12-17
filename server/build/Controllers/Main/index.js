"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main;
(function (Main) {
    Main.module = (app, route) => {
        if (!app)
            return null;
        route.get("/list", (req, res) => {
            res.sendStatus(200);
        });
    };
})(Main || (Main = {}));
exports.default = Main;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQ29udHJvbGxlcnMvTWFpbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLElBQVUsSUFBSSxDQVFiO0FBUkQsV0FBVSxJQUFJO0lBQ0csV0FBTSxHQUFHLENBQUMsR0FBYyxFQUFFLEtBQW1CLEVBQWUsRUFBRTtRQUN2RSxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRXRCLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzVCLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDLENBQUE7QUFDTCxDQUFDLEVBUlMsSUFBSSxLQUFKLElBQUksUUFRYjtBQUVELGtCQUFlLElBQUksQ0FBQyJ9