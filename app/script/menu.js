/**
 * 建立angular.module
 */
define(function() {
    var menu = [
        {
            "name": "SMS",
            "url": "/",
            "icon":"fa-th",
            "children": [
                
                {"name":"独立服务器","icon":"fa-th","url":"/dedicated"},
                {"name":"VPS","icon":"fa-th","url":"/vps"},
               
            ]
        }
    ]

    return menu;
});
