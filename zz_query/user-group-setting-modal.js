var bindData
$(document).ready(function () {
    showFuncBind('342985347550285')
})

//綁定
function showFuncBind(master_sid) {
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S362920901330737_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: "SEC_USERGROUP", //a.MASTER_TABLE_NAME
            DetailTable: "SEC_USERGROUP_FUNCTION_LIST", // a.RELATION_TABLE_NAME
            SearchTable: "V_SEC_SITEMAP_EC", // a.DETAIL_TABLE_NAME
            MasterSIDField: "GROUP_SID", //a.MASTER_SID_FIELD
            DetailSIDField: "GROUP_FUN_LIST_SID", //a.RELATION_SID_FIELD
            SearchSIDField: "FUN_SID", // a.DELAIL_SID_FIELD
            RelationMasterSIDField: "GROUP_SID", //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: "FUN_SID", //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QueryDetail',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: "SEC_USERGROUP_FUNCTION_LIST.GROUP_FUN_LIST_SID,V_SEC_SITEMAP_EC.FUN_SID,V_SEC_SITEMAP_EC.ETEXT,V_SEC_SITEMAP_EC.NAVIGATEURL,V_SEC_SITEMAP_EC.EDIT_TIME",// a.RELATION_TABLE_NAME+ '.' + a.RELATION_SID_FIELD + ,a.DETAIL_TABLE_NAME+ '.' + 'c.COL_NAME'
            defaultSort: ' order by EDIT_TIME Desc'
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: "EDIT_TIME", //a.DETAIL_SORT_NAME
        sortOrder: "Desc", //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            bindData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    console.log(bindData)

    // var ENABLE_FLAG_Y = '<input type="checkbox" id = "enable_flag" name = "enable_flag" value = "Y" checked="checked">';
    // var BindData = [];
    // for(var i=0 ;i<GridData.rows.length;i++){
    //     ENABLE_FLAG_Y = '<input type="checkbox" id = "enable_flag'+ enable_flag_num +'" name = "enable_flag" value = "Y" checked="checked">'
    //     CurrentRow.push(ENABLE_FLAG_Y);
    //     for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
    //     {
    //         CurrentRow.push(GridData.rows[i][MD_Columns_Detail_ColList[j]]);
    //     }
    //     BindData.push(CurrentRow);
    //     AllGridData.push([GridData.rows[i][MD_Maintain_Data.rows[0].RELATION_SID_FIELD],GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]]);
    //     FUN_SID_ORIGIN_BIND_LIST.push(GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]);
    //     FUN_SID_ALL_BIND_LIST.push(GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]);
    //     enable_flag_num++;
    //     CurrentRow = [];
    // };
    
    // $("#trDT").append('<th>'+GetLangDataV2('Check Bind')+'</th>');//是否啟用
    // for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
    // {
    //     $("#trDT").append('<th>'+ GetLangDataV2(MD_Columns_Detail_ColList[j]) +'</th>');
    // }

    // DetailTable = $('#MasterMaintainDetail').DataTable({
    //     data: BindData,
    //     dom: 'frtp',
    //     // searching: false,
    //     language: {
    //         search: GetLangDataV2("search:"), // 將"Search"更改為"搜尋："
    //         lengthMenu: GetLangDataV2("Show _MENU_ entries"), // 自定義顯示條目數的文本為中文
    //         info: GetLangDataV2("Showing _START_ to _END_ of _TOTAL_ entries"),//"顯示第 _START_ 到 _END_ 條，共 _TOTAL_ 條", // 
    //         infoEmpty: GetLangDataV2("Showing 0 to 0 of 0 entries"),//"顯示 0 到 0 條，共 0 條"
            
    //         paginate: {
    //             previous: GetLangDataV2("Previous"),//"上一頁", // 將"Previous"更改為"上一頁"
    //             next: GetLangDataV2("Next"),//"下一頁" // 將"Next"更改為"下一頁"
    //           }
            
    //       }, 
    //      fnDrawCallback: function(){
    //         getAdd_Del_List();
    //      },
    //      initComplete: function() {
    //         $("#MasterMaintainDetail_filter").hide() // 隱藏dataTable原生搜尋欄
    //         // 關鍵字搜尋
    //         $('#searchBtn').on('click', function() {
    //             DetailTable.search($("#keyword").val()).draw();
    //         });
    //         $('#keyword').on('keydown', function(e) {
    //             if (e.key === 'Enter') {
    //                 DetailTable.search($(this).val()).draw();
    //             }
    //         });
    //     }
    // });
};


//未綁定(需與bind()一起使用)
function unbind(master_sid) {
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S148122421380739_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: MD_Maintain_Data.rows[0].MASTER_TABLE_NAME, //a.MASTER_TABLE_NAME
            DetailTable: MD_Maintain_Data.rows[0].RELATION_TABLE_NAME, //a.RELATION_TABLE_NAME
            SearchTable: MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME, // a.DETAIL_TABLE_NAME
            MasterSIDField: MD_Maintain_Data.rows[0].MASTER_SID_FIELD, //a.MASTER_SID_FIELD
            DetailSIDField: MD_Maintain_Data.rows[0].RELATION_SID_FIELD, //a.RELATION_SID_FIELD
            SearchSIDField: MD_Maintain_Data.rows[0].DELAIL_SID_FIELD, // a.DELAIL_SID_FIELD
            RelationMasterSIDField: MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD, //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD, //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QuerySearch',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: MD_Columns_Search_Data, // d.COL_NAME
            defaultSort: ' order by ' + MD_Maintain_Data.rows[0].DETAIL_SORT_NAME + ' ' + MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER // order by " + a.DETAIL_SORT_NAME + a.DETAIL_SORT_ORDER
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: MD_Maintain_Data.rows[0].DETAIL_SORT_NAME, //a.DETAIL_SORT_NAME
        sortOrder: MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER, //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            GridData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    var ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag" name = "enable_flag" value = "N">';
    //var BindData = [];
    for(var i=0 ;i < GridData.rows.length;i++){
        ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag'+ enable_flag_num +'" name = "enable_flag" value = "N">'
        CurrentRow.push(ENABLE_FLAG_N);
        for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
        {
            CurrentRow.push(GridData.rows[i][MD_Columns_Detail_ColList[j]]);
        }
        //BindData.push([ENABLE_FLAG_N,GridData.rows[i].ETEXT,GridData.rows[i].NAVIGATEURL]);
        BindData.push(CurrentRow);
        AllGridData.push(["NoData",GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]]);
        // FUN_SID_UNBIND_LIST.push(GridData.rows[i].FUN_SID);
        enable_flag_num++;
        CurrentRow = [];
    };
    var BindDataTable = $('#MasterMaintainDetail').DataTable()
    BindDataTable.rows.add(BindData).draw();
};