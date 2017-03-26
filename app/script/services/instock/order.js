define(['app'], function(app) {

    app.factory('WhinOrderService', ['$q', 'sl', function($q, sl) {
        var atom = sl.atom;

        return {

            'get': function(id) {
                return atom.get(id);
            },

            'list': function(paras) {
                return atom.get('local://whin.orider.list', paras);
            }
        }
    }]);
})
