//準備參數
let orderGridSID = '356089579733373'; //V_ZZ_BTB_ORDER_V_HEADER (ERP訂單 單頭)
let orderGrid;

let table

$(document).ready(async function() {
    orderGrid = await getGridDataOrder(orderGridSID)
    displayOrders(orderGrid)
});

function getGridDataOrder(SID) {
    return new Promise((resolve, reject) => {
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetData';

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
        let orderHtml = `
            <tr>
                <td>${order.XMDADOCNO}</td>
                <td>${order.XMDA007}</td>
                <td>${order.XMDA004}</td>
                <td>${order.PMAAL004_A}</td>
                <td>${order.XMDA033}</td>
                <td>${order.XMDA008}</td>
                <td>${order.XMDADOCDT}</td>
                <td>
                    <button class="btn btn-success" onclick="viewDetail('${order.XMDADOCNO}')">
                        <img src="../img/comm/FontAwesome/document.svg" alt="edit">
                    </button>
                </td>
            </tr>
        `;
        $("#orderContainer").append(orderHtml);
    });

    table = new DataTable("#example", {
        stateSave: true,
        paging: true,
        scrollCollapse: true,
        pageLength: 10, // 預設每頁顯示10筆資料
        order: [[ 6, "desc" ]],
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
                    var date = data[4]; // 下單時間在第 5 欄
        
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
function viewDetail(XMDADOCNO){
    window.location.href = window.location.protocol+"//" + default_ip +"/"+PROJECT_NAME+"/zz_query/orderMaintainDetail-ERP.html?erp=" + XMDADOCNO;
}