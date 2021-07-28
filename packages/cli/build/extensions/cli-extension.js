"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// add your CLI-specific functionality here, which will then be accessible
// to your commands
module.exports = function (toolbox) {
    toolbox.foo = function () {
        toolbox.print.info('called foo extension');
    };
    // enable this if you want to read configuration in from
    // the current folder's package.json (in a "jsx-lite" property),
    // jsx-lite.config.json, etc.
    // toolbox.config = {
    //   ...toolbox.config,
    //   ...toolbox.config.loadConfig("jsx-lite", process.cwd())
    // }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLWV4dGVuc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zL2NsaS1leHRlbnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSwwRUFBMEU7QUFDMUUsbUJBQW1CO0FBQ25CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBQyxPQUF1QjtJQUN2QyxPQUFPLENBQUMsR0FBRyxHQUFHO1FBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtJQUM1QyxDQUFDLENBQUE7SUFFRCx3REFBd0Q7SUFDeEQsZ0VBQWdFO0lBQ2hFLDZCQUE2QjtJQUM3QixxQkFBcUI7SUFDckIsdUJBQXVCO0lBQ3ZCLDREQUE0RDtJQUM1RCxJQUFJO0FBQ04sQ0FBQyxDQUFBIn0=