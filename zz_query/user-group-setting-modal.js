$(document).ready(function () {
    //設置功能選單
    $("#MMList").change(()=>{
        setFunctionList(masterSID)
    }).trigger('change')

    //保存群組設定
    $("#saveSettingsBtn").click(()=>settingSave(masterSID))

    $("#createGroupBtn").click(()=>createGroup())
    $("#deleteGroupBtn").click(()=>deleteGroup())
})

function setFunctionList(masterSID){
    //取得功能清單資料
    let allBindData = getAllBindData(masterSID)

    //排序
    allBindData.sort((a, b) => {
        return a.EDIT_TIME.localeCompare(b.EDIT_TIME);
    });

    let functionListHtml = ''
    allBindData.forEach((fun,index) => {
        let FUN_SID = fun.FUN_SID
        let GROUP_FUN_LIST_SID = fun.GROUP_FUN_LIST_SID || ""
        let isBind = fun.GROUP_FUN_LIST_SID ? true : false;

        functionListHtml += `
            <div class="col-6 mb-2">
                <div class="form-check">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        id="fun${index}"
                        data-fun-sid="${FUN_SID}"
                        data-group-fun-list-sid="${GROUP_FUN_LIST_SID}"
                        ${isBind ? 'checked' : ''}
                    >
                    <label class="form-check-label" for="fun${index}">
                        ${fun.ETEXT}
                    </label>
                </div>
            </div>
        `
    });

    $("#functionList").html(functionListHtml)

    
    function getAllBindData(master_sid) {
        let bindData,unbindData
        // 已綁定清單
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
                let jsonObj = jQuery.parseJSON(msg);
                bindData = jsonObj.rows;
            }, error: function (msg) {
                let jsonObj = msg;
                console.log('error:',jsonObj)
            }
        });
        // 未綁定清單
        $.ajax({
            type: 'POST',
            title: 'Unassigned',
            footer: '#S148122421380739_QUERY_ft',
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
                operType: 'QuerySearch',
                UserName: 'ADMINV2',
                rows: '1000',
                page: '1',
                _search: false,
                COLUMNS: "GROUP_FUN_LIST_SID,GROUP_SID,FUN_SID,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME,M_FLAG,D_FLAG", // d.COL_NAME
                defaultSort: ' order by EDIT_TIME Desc' // order by " + a.DETAIL_SORT_NAME + a.DETAIL_SORT_ORDER
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
                let jsonObj = jQuery.parseJSON(msg);
                unbindData = jsonObj.rows;
            }, error: function (msg) {
                let jsonObj = msg;
                console.log('error:',jsonObj)
            }
        });

        return [...bindData,...unbindData]
    };
}

async function settingSave(masterSID){
    const addGroup = []; // 儲存 data-fun-sid 的陣列
    const delGroup = [];  // 儲存 data-group-fun-list-sid 的陣列

    // 組成 新增&刪除清單
    $('#functionList .form-check-input').each(function() {
        const FUN_SID = $(this).data('fun-sid');
        const GROUP_FUN_LIST_SID = $(this).data('group-fun-list-sid');

        if ($(this).is(':checked') && !GROUP_FUN_LIST_SID) {
            // 若 checkbox 已勾選且 未綁定
            addGroup.push(FUN_SID);
        } else if (!$(this).is(':checked') && GROUP_FUN_LIST_SID) {
            // 若 checkbox 未勾選且 已綁定
            delGroup.push(GROUP_FUN_LIST_SID);
        }
    });

    // 保存變更
    let yes = await customConfirm("確定要保存設定嗎?");
    if (yes)
    {
        try{
            for (let i = 0; i < addGroup.length; i++){
                addFunc(addGroup[i],masterSID);
            }
            for (let j = 0; j < delGroup.length; j++){
                delFunc(delGroup[j],masterSID);
            }
            await customAlertSuccess('設定保存成功')
            $("#settingsModal").modal('hide')
        }catch{
            await customAlertError('設定保存失敗')
            $("#settingsModal").modal('hide')
        }
    }

    //新增
    function addFunc(func_sid, master_sid) {
        $.ajax({
            type: "POST",
            url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
            data: 'MasterTable=' + "SEC_USERGROUP" + '&DetailTable=' + "SEC_USERGROUP_FUNCTION_LIST" + '&SearchTable=' + "V_SEC_SITEMAP_EC" //a.MASTER_TABLE_NAME , a.RELATION_TABLE_NAME ,a.DETAIL_TABLE_NAME
                + '&MasterSIDField=' + "GROUP_SID" + '&DetailSIDField=' + "GROUP_FUN_LIST_SID" + '&SearchSIDField=' + "FUN_SID" //a.MASTER_SID_FIELD,a.RELATION_SID_FIELD,a.DELAIL_SID_FIELD
                + '&RelationMasterSIDField=' + "GROUP_SID" //a.RELATION_MASTER_SID_FIELD
                + '&RelationDetailSIDField=' + "FUN_SID" //a.RELATION_DETAIL_SID_FIELD
                + '&oper=add&DetailSids=' + func_sid + '&MasterSid=' + master_sid + '&UserName='+ 'ADMINV2',
            success: function (msg) {
                let jsonObj = msg;
            }, error: function (msg) {
                let jsonObj = msg;
            }
        })
    };
    //刪除
    function delFunc(group_func_list_sid, master_sid) {
        $.ajax({
            type: "POST",
            url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
            data: 'MasterTable=' + "SEC_USERGROUP" + '&DetailTable=' + "SEC_USERGROUP_FUNCTION_LIST" + '&SearchTable=' + "V_SEC_SITEMAP_EC" //a.MASTER_TABLE_NAME , a.RELATION_TABLE_NAME ,a.DETAIL_TABLE_NAME
                + '&MasterSIDField=' + "GROUP_SID" + '&DetailSIDField=' + "GROUP_FUN_LIST_SID" + '&SearchSIDField=' + "FUN_SID" //a.MASTER_SID_FIELD,a.RELATION_SID_FIELD,a.DELAIL_SID_FIELD
                + '&RelationMasterSIDField=' + "GROUP_SID"  //a.RELATION_MASTER_SID_FIELD
                + '&RelationDetailSIDField=' + "FUN_SID" //a.RELATION_DETAIL_SID_FIELD
                + '&oper=del&DeleteSids=' + group_func_list_sid + '&MasterSid=' + master_sid + '&UserName=' + 'ADMINV2',
            success: function (msg) {
                let jsonObj = msg;
            }, error: function (msg) {
                let jsonObj = msg;
            }
        })
    };
}

function createGroup(){
    let AddVal = ` N'${$("#createGroupName").val()}', N'Y', N'福盈人員建立群組',`
    $.ajax({
        type: 'post',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
        data: { funcName: "AddSingleRowData", TableName: "SEC_USERGROUP", AddVal: AddVal, AddTitle: "GROUP_NAME,ENABLE_FLAG,DESCRIPTION,GROUP_SID", USER: "ADMINV2",SID_VAL : "50603545907267" ,log_val: AddVal },
        dataType: 'json',
        async: false,
        success: async function (result) {
            await customAlertSuccess("新建群組成功")
            location.reload()
        },
        error: function (xhr, ajaxOptions, thrownError) {
            if (xhr.status = 500)
                alert("資料格式錯誤!");
            alert(thrownError);
        }
    });
}

async function deleteGroup() {
    let yes = await customConfirm(`確定要刪除 ${currentGroupName} 嗎?`);
    if(yes){
        $.ajax({
            type: 'post',
            url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            data: { funcName: "DelRowData", TableName: "SEC_USERGROUP", Delval: masterSID, SID: "GROUP_SID" ,SID_VAL : "50603545907267" ,USER: "ADMINV2" },
            dataType: 'json',
            async: false,
            success: async function (result) {
                await customAlertSuccess(`${currentGroupName} 已刪除`)
                location.reload()
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status = 500)
                    alert("資料格式錯誤!");
                alert(thrownError);
            }
        });
    }
}