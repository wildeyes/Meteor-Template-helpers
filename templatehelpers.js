/*jshint strict:false */
/*global Template:false */
/*global _:false */
/*global Session:false */
/*global console:false */

/*
 * @description Get or set session value from views via Session helper
 * @example
 * GET: {{Session 'key'}}
 * SET: {{Session 'key' set="new value"}}
 * SET Default: {{Session 'key' set="new value" action="setDefault"}}
 *
 */
Template.registerHelper('Session', function(key, adds) {
    var set, action;
    if(_.isUndefined(adds)){
        action = 'get';
    }

    if(_.isString(adds)){
        action = 'get';
    }

    if(_.isObject(adds)){
        action = 'get';
        if(_.has(adds.hash, 'set')){
            action = (_.has(adds.hash, 'action')) ? adds.hash.action : 'set';
            set = adds.hash.set || undefined;
        }
    }

    switch(action){
        case 'setDefault':
            Session.setDefault(key, set);
            return undefined;

        case 'set':
            Session.set(key, set);
            return undefined;

        case 'get':
        default:
            return Session.get(key);
    }
});


/*
 *
 * @description Debug helper console log
 * and return passed objects as a string
 *
 */
Template.registerHelper('log', function(key, adds) {
    console.log('arguments: ', arguments, 'this: ', this);
    return JSON.stringify(key, null, 2) + ' | ' + JSON.stringify(adds, null, 2);
});


/*
 *
 * @description Compare two values in template
 *
 */
var compare = function(args){
    var res = [];
    if(args.length > 3){
        var andy = true;
        var currentState = args[0];
        for (var i = 0; i < args.length - 1; ) {
            operator = args[++i];
            if(!!~['or', '||', '!|', '|!', '!|!', 'nor', 'xor', 'nxor', '!||'].indexOf(operator)){
                andy = false;
            }

            if(!!~['and', '&&', '!&', '&!', '!&!', 'nand', '!&&'].indexOf(operator)){
                res = [!!~res.indexOf(true)];
                if(args.length > i + 2){
                    currentState = args[++i];
                    operator = args[++i];
                }
            }
            res.push(!!compare([currentState, operator, args[++i]]));
            currentState = args[i];
        }
        if(andy){
            return !~res.indexOf(false) && !~res.indexOf(undefined) && !~res.indexOf(null);
        } else {
            return !!~res.indexOf(true);
        }

    } else {
        var first = args[0], second = args[2], operator = args[1];
        if(_.isObject(first) && _.isObject(second)){
            first = JSON.stringify(first);
            second = JSON.stringify(second);
        }

        if(_.isString(second) && second.indexOf('|') !== -1){
            var Things = second.split('|');
            for (var i = Things.length - 1; i >= 0; i--) {
                res.push(compare([first, operator, Things[i]]));
            }

            return !!~res.indexOf(true);
        }else{
        
            switch (operator){
                case '>':
                case 'gt':
                case 'greaterThan':
                    return (first > second);

                case '>=':
                case 'gte':
                case 'greaterThanEqual':
                    return (first >= second);

                case '<':
                case 'lt':
                case 'lessThan':
                    return (first < second);

                case '<=':
                case 'lte':
                case 'lessThanEqual':
                    return (first <= second);

                case '===':
                case 'is':
                    return (first === second);

                case '!==':
                case 'isnt':
                    return (first !== second);

                case 'isEqual':
                case '==':
                    return (first == second);

                case 'isNotEqual':
                case '!=':
                    return (first != second);

                case '&&':
                case 'and':
                    return (first && second);

                case '&!':
                    return (first && !second);

                case '!&':
                    return (!first && second);

                case '!&!':
                    return (!first && !second);

                case '||':
                case 'or':
                    return (first || second);

                case '!|':
                    return (!first || second);

                case '|!':
                    return (first || !second);

                case '!|!':
                    return (!first || !second);

                case '!||':
                case 'nor':
                    return !(first || second);

                case '!&&':
                case 'nand':
                    return !(first && second);

                case 'xor':
                    return ((first && !second) || (!first && second));

                case 'nxor':
                    return !((first && !second) || (!first && second));

                default:
                    console.error('[ostrio:templatehelpers] [comparison operator: "'+operator+'" is not supported!]');
                    return false;
            }
        }
    }
};

Template.registerHelper('compare', function() {
    args = Array.prototype.slice.call(arguments);
    args.pop();
    return compare.call(null, args);
});


/*
 *
 * @description Use underscore as a helper
 *
 */
Template.registerHelper('_', function() {
    var args, fn, self;
    args = Array.prototype.slice.call(arguments);
    if(args.length){
        self = this;
        fn = args[0];
        args.shift();
        args.pop();
        return _[fn].apply(self, args);
    } else {
        return undefined;
    }
});