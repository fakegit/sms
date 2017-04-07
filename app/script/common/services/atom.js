/**
 * [原子操作]
 */

define(['app'], function(app) {
    app.factory('core', function() {

        return {
            // 启用 / 禁用
            toggle: function(row) {
                var id = row.id;
                var toggle_status = row.status == 1 ? 0 : 1;


                loadingTimeout = $timeout(function() {
                    page.loading = true;
                }, loadingLatency);

                service.toggle({ goodsId: id, status: toggle_status }).then(function(resp) {
                    if (resp.returnCode) {
                        sl.alert(resp.returnMsg);
                    } else {
                        row.status = toggle_status;
                    }
                    $timeout.cancel(loadingTimeout);
                    page.loading = false;
                })
            }
        }
    });
})
