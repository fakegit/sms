define(function() {
    var menu = [
        {
            "name": "独立服务器",
            "url": "/dedi",
            "icon":"fa-th",
        },
        {
            "name": "VPS",
            "url": "/vps/provider",
            "icon":"fa-th",
            children:[
                {
                    "name": "服务",
                    "url": "/vps/server",
                },{
                    "name": "供应商",
                    "url": "/vps/provider",
                },
            ]
        },
        {
            "name": "虚拟主机",
            "url": "/host",
            "icon":"fa-th",
            
        },
        {
            "name": "系统配置管理",
            "url": "/sys",
            "icon":"fa-th",
            "children":[]
        }
    ]

    return menu;
});
