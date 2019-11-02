export const initPolyfills = () => {
    /*eslint no-extend-native: ["off", { "exceptions": ["Object"] }]*/
    String.prototype.includes = function(search, start) {
        debugger;
        if (search instanceof RegExp) {
            throw TypeError("first argument must not be a RegExp");
        }
        if (start === undefined) {
            start = 0;
        }
        return this.indexOf(search, start) !== -1;
    };
};
