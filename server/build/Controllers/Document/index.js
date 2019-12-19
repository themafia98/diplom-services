"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Document;
(function (Document) {
    Document.module = (app, route) => {
        if (!app)
            return null;
        route.get("/list", (req, res) => {
            res.sendStatus(200);
        });
    };
})(Document || (Document = {}));
exports.default = Document;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvQ29udHJvbGxlcnMvRG9jdW1lbnQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxJQUFVLFFBQVEsQ0FRakI7QUFSRCxXQUFVLFFBQVE7SUFDRCxlQUFNLEdBQUcsQ0FBQyxHQUFjLEVBQUUsS0FBbUIsRUFBZSxFQUFFO1FBQ3ZFLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFdEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDNUIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQTtBQUNMLENBQUMsRUFSUyxRQUFRLEtBQVIsUUFBUSxRQVFqQjtBQUVELGtCQUFlLFFBQVEsQ0FBQyJ9