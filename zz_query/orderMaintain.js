//準備參數
let orderGridSID = '351511835020401'; //V_ZZ_ORDER_RECORD
let orderGrid;
// URL取參
let currentURL = new URL(window.location.href);
let URLparams = new URLSearchParams(currentURL.search);
let filter = URLparams.get('filter');
// 取得日期 用於過濾訂單日期
let now = new Date();
let today = now.toLocaleDateString('en-CA'); // ex: 2024-01-01

let table

$(document).ready(async function() {
    orderGrid = await getGridDataOrder(orderGridSID)
    console.log(orderGrid)
    displayOrders(orderGrid)
});

function getGridDataOrder(SID) {
    return new Promise((resolve, reject) => {
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetGrid';

        // 定义查詢条件参数对象
        let conditions = {
            // Field: [],
            // Oper: [],
            // Value: []
        };

        // 构建请求体
        let requestBody = JSON.stringify(conditions);

        $.ajax({
            url: getGridURL, // 替換為你的API端點
            type: 'POST',
            data: requestBody,
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
                'SID': SID
            },
            success: function(response) {
                if(response.result){
                    resolve(response.Grid_Data);
                } else {
                    Set_Clean();
                    reject('Error: No result in response');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error:', textStatus, errorThrown);
                $('#postDataResult').text('Error: ' + textStatus + ', ' + errorThrown);
                reject('Error: ' + textStatus + ', ' + errorThrown);
            }
        });
    });
}

function displayOrders(orderGrid){
    orderGrid.forEach(function (order) {
        let statusHtml;
        if(order.EXPORT_LOCK_FLAG === 'N'){
            statusHtml = '<span style="color:#fda42d">處理中</span><img src="../img/weyu/clock.svg">'
        }else{
            statusHtml = '<span style="color:#2cba1e">已確認</span><img src="../img/weyu/check.svg">'
        }

        // let orderHtml = `
        //     <tr>
        //         <td>${order.ORDER_NUMBER}</td>
        //         <td>(業秘)</td>
        //         <td>${order.PMAAL004_A}</td>
        //         <td>${order.USER_NAME}</td>
        //         <td class="text-end">$${formatNumber(order.TOTAL_AMOUNT)}</td>
        //         <td>${order.ADDRESS}</td>
        //         <td>${order.PURCHASE_ORDER||''}</td>
        //         <td>${order.ORDER_DATE.replace('T',' ')}</td>
        //         <td>${statusHtml}</td>
        //         <td>
        //             <button class="btn btn-success" onclick="viewDetail('${order.ORDER_NUMBER}','${order.ZZ_ORDER_RECORD_SID}')">
        //                 <img src="../img/comm/FontAwesome/document.svg" alt="edit">
        //             </button>
        //         </td>
        //         <td>
        //             <input type="checkbox" data-order-sid="${order.ZZ_ORDER_RECORD_SID}">
        //         </td>
        //     </tr>
        // `;
        let orderHtml = `
            <tr>
                <td>${order.ORDER_NUMBER}</td>
                <td>${order.PMABUAL005}</td>
                <td>${order.PMAAL004_A}</td>
                <td>${order.USER_NAME}</td>
                <td>${order.ADDRESS}</td>
                <td>${order.PURCHASE_ORDER||''}</td>
                <td>${order.ORDER_DATE.replace('T',' ')}</td>
                <td>${statusHtml}</td>
                <td>
                    <button class="btn btn-success" onclick="viewDetail('${order.ORDER_NUMBER}','${order.ZZ_ORDER_RECORD_SID}')">
                        <img src="../img/comm/FontAwesome/document.svg" alt="edit">
                    </button>
                </td>
                <td>
                    <input type="checkbox" data-order-sid="${order.ZZ_ORDER_RECORD_SID}">
                </td>
            </tr>
        `;
        $("#orderContainer").append(orderHtml);
    });

    table = new DataTable("#example", {
        paging: true,
        scrollCollapse: true,
        pageLength: 10, // 預設每頁顯示10筆資料
        // search: {search: filter === 'today' ? today : ''}
        order: [[ 6, "desc" ]],
        columnDefs: [{
            orderable:false,
            target:[8,9]
        }],
        initComplete: function() {
            $(".dataTables_filter").hide() // 隱藏dataTable原生搜尋欄
            $("#searchBar").removeClass('d-none') // 顯示客製搜尋欄
            $('#search-keyword').on('keyup change', function() {
                table.search(this.value).draw();
            });
            $('#search-from').on('change', function() {
                table.draw();
            });
            $('#search-to').on('change', function() {
                table.draw();
            });

            $.fn.dataTable.ext.search.push( //為dataTable添加自定義的搜尋函數，用於搜尋日期範圍
                function(settings, data, dataIndex) {
                    var min = $('#search-from').val() ? $('#search-from').val() + " 00:00:00" : ""
                    var max = $('#search-to').val() ? $('#search-to').val() + " 23:59:59" : ""
                    var date = data[6]; // 下單時間在第 7 欄
        
                    if (
                        (min === "" && max === "") ||
                        (min === "" && date <= max) ||
                        (min <= date && max === "") ||
                        (min <= date && date <= max)
                    ) {
                        return true;
                    }
                    return false;
                }
            );
        },
        language: {
            "sProcessing": "處理中...",
            "sLengthMenu": "每頁顯示 _MENU_ 項結果",
            "sZeroRecords": "沒有匹配結果",
            "sInfo": "顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
            "sInfoEmpty": "顯示第 0 至 0 項結果，共 0 項",
            "sInfoFiltered": "(由 _MAX_ 項結果過濾)",
            "sInfoPostFix": "",
            "sSearch": "搜尋:",
            "sUrl": "",
            "sEmptyTable": "表中資料為空",
            "sLoadingRecords": "載入中...",
            "sInfoThousands": ",",
            "oPaginate": {
                "sFirst": "首頁",
                "sPrevious": "上一頁",
                "sNext": "下一頁",
                "sLast": "末頁"
            },
            "oAria": {
                "sSortAscending": ": 以升序排列此列",
                "sSortDescending": ": 以降序排列此列"
            }
        }
    });
}

function viewDetail(ORDER_NUMBER,ZZ_ORDER_RECORD_SID){
    // window.location.href = window.location.protocol+"//localhost/"+PROJECT_NAME+"/zz_query/orderMaintainDetail.html?order=" + ORDER_NUMBER + "&sid=" + ZZ_ORDER_RECORD_SID;
    window.location.href = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/zz_query/orderMaintainDetail.html?order=" + ORDER_NUMBER + "&sid=" + ZZ_ORDER_RECORD_SID;
}


//匯出excel
//1. 近7天未下載 全印出
function exportAllProcessing() {
    let yes = confirm('下載過的訂單將不可修改，確定繼續嗎?');
    if(yes){
        let body = {
            "LOGIN_USER": localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO')
        };
      
        // 將查詢參數轉換為 URL query string 格式
        let queryString = $.param(body);
      
        $.ajax({
            url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/RECENT_DAYS_EXPORT?' + queryString,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
            },
            success: function(response) {
                if(response.result){
                    let src = response.PATH.match(/File\\.*$/);
                    let url = `${window.location.protocol}//${default_ip}/${default_Api_Name}/${src[0]}`
                    window.location.href = url
                    alert('訂單下載成功!')
                    location.reload()
                }else{
                    // alert(response.Msg)
                    alert("近七日沒有未下載的訂單.")
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error:', textStatus, errorThrown);
                alert('Export Fail.')
            }
        });

    }
}
//2. 下載勾選的訂單
function exportSpecify() {
    let yes = confirm('下載過的訂單將不可修改，確定繼續嗎?');
    if(yes){
        let rows = table.rows().nodes(); // 獲取所有行的節點
        let selectedRows = [];
        
        // 找出有勾選的行
        $(rows).each(function(index, row) {
            let $checkbox = $(row).find('[type=checkbox]');
            if ($checkbox.prop('checked')) {
                selectedRows.push({
                    "ZZ_ORDER_RECORD_SID":$checkbox.data('order-sid')
                })
            }
        });
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/SPECIFY_EXPORT';

        // 定义查詢条件参数对象
        let conditions = {
            "SPECIFY_EXPORT_DETAIL": selectedRows,
            "LOGIN_USER": localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO')
        };

        // 构建请求体
        let requestBody = JSON.stringify(conditions);

        $.ajax({
            url: getGridURL, // 替換為你的API端點
            type: 'POST',
            data: requestBody,
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
            },
            success: function(response) {
                if(response.result){
                    let src = response.PATH.match(/File\\.*$/);
                    let url = `${window.location.protocol}//${default_ip}/${default_Api_Name}/${src[0]}`
                    window.location.href = url
                    alert('訂單下載成功!')
                    location.reload()
                }else{
                    console.log(response)
                    // alert(response.Msg)
                    alert("錯誤")
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert("未選擇訂單.")
                console.error('Error:', textStatus, errorThrown);
            }
        });
    }
}