//準備參數
let newsGridSID = '351599528316128'; // ZZ_NEWS_HYPERLINK
let newsGrid;
let table;

async function fetchData(){
  newsGrid = await getGridDataV2(newsGridSID)
  displayNews(newsGrid)
}
fetchData()


$('#newsFile').change(function(){
  let selectedFile = this.files[0];
  // $('#newsFile')[0].files[0] 等同於 this.files[0]
  if(selectedFile){
    $('#filename').text(selectedFile.name)
    $('#uploadfileImage').hide()
    $('#filenameWrapper').show()
  }else{
    $('#filenameWrapper').hide()
    $('#uploadfileImage').show()
  }
});

$('#filenameWrapper img').click(function(){
  $('#newsFile').val(null)
  $('#filenameWrapper').hide()
  $('#uploadfileImage').show()
})

function displayNews(newsGrid){
  newsGrid.forEach(function (news) {
    let src,url,titleHtml;
    if(news.FILE_URL !== "NULL"){
      src = news.FILE_URL.match(/news\\.*$/);
      url = `${window.location.protocol}//${default_ip}/${default_Api_Name}/${src[0]}`
      titleHtml = `<a href="${url}" target="_blank">${news.TITLE}</a>`
    }else{
      titleHtml = `<a>${news.TITLE}</a>`
    }
    let newsHtml = `
      <tr id="item_${news.SID}">
        <td>${news.DATE.split('T')[0]}</td>
        <td>
          ${titleHtml}
          <button
            class="news-Item btn btn-danger p-0"
            onclick="openDeleteModal('${news.SID}')"
          >
            <img src="../img/comm/FontAwesome/trash-solid.svg" alt="remove" />
          </button>
        </td>
      </tr>
    `;
    $("#newsContainer").append(newsHtml);
  });
  table = new DataTable("#newsTable", {
    // paging: false,
    stateSave: true,
    stateSaveParams: function (settings, data) {
      // 只保存排序和分頁，不保存搜尋
      data.search = {};
      data.columns.forEach(column => {
          column.search = {};
      });
  },
    info: false,
    scrollCollapse: true,
    scrollY: "60vh",
    iDisplayLength: 10,
    order: [[ 0, "desc" ]], //照日期排序
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
  // $('#newsTable_length').hide()
}

function openDeleteModal(newsSID){
  $('#deleteSave').attr('onclick',`deleteNews('${newsSID}')`)
  $('#deleteNewsConfirmationModal').modal('show')
}

function deleteNews(newsSID){
  let requestBody = {
      "SID":newsSID,
      "LOGIN_USER":localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO'),
  };

  $.ajax({
      url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+ "/api/OPI_NEWS", // 替換為你的API端點
      type: 'DELETE',
      data: JSON.stringify(requestBody), // 将body对象转换为JSON字符串
      dataType: 'json',
      contentType: 'application/json',
      headers: {
          'TokenKey':localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
      },
      success: function(response) {
        if(response.result==true){
          // let selectedRow = $(`#item_${newsSID}`);
          // table.row(selectedRow).remove().draw(false);
          $('#deleteNewsConfirmationModal').modal('hide')
          location.reload()
        }else{
          alert(response.result)
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error('Error:', textStatus, errorThrown);
      }
  });

}

$('#addNews').click(function(){
  $('#addNews').hide()
  $(".loader").show()

  let formData = new FormData();
  formData.append('DATE', $('#upload-date').val());
  formData.append('TITLE', $('#upload-title').val());
  formData.append('LOGIN_USER', localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO'));
  formData.append('FILE', $('#newsFile')[0].files[0]||"");
  
  $.ajax({
      url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+ "/api/OPI_NEWS", // 替換為你的API端點
      type: 'POST',
      data: formData,
      processData: false,  // 告诉 jQuery 不要处理发送的数据
      contentType: false,  // FormData 已经帮我们设置了正确的 Content-Type
      headers: {
          'TokenKey':localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
      },
      success: function(response) {
        if(response.result===true){
          // $('#upload-date').val(null)
          // $('#upload-title').val(null)
          // $('#newsFile').val(null)
          // $('#newsFile').trigger('change')
          $(".loader").hide()
          $('#addNews').show()
          $('#addNewsModal').modal('hide')
          location.reload()
        }else{
          alert('Upload Fail.')
          $(".loader").hide()
          $('#addNews').show()
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Error:', textStatus, errorThrown);
        alert('Upload Fail.')
        $(".loader").hide()
        $('#addNews').show()
      }
  });

})

// 拖拉上傳
function dropHandler(ev) {
  ev.preventDefault();

  var dt = new DataTransfer();

  if (ev.dataTransfer.items.length > 1) {
    alert('Only one file is allowed.');
  } else {
    // If dropped items aren't files, reject them
    if (ev.dataTransfer.items[0].kind === "file") {
      var file = ev.dataTransfer.items[0].getAsFile();
      dt.items.add(file);
    }

    $('#newsFile')[0].files = dt.files;
    $('#newsFile').trigger('change');
  }
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

