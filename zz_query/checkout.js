var userDataSID = '350990892916491'; //SEC_USER
var userData;

// On the checkout page
let requestBody = {};

$(document).ready(async function() {
  // 自動填入客戶資料
  userData = await getGridDataV2(userDataSID)
  userData.forEach((e)=>{
    if(e.ORIGINAL_ACCOUNT_NO === localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO')){
      $("#customer").val(e.PMAAL004_A);
      // $("#address").html(initAddressOption(e.OOFB017));
      $("#address").val(e.OOFB017);
      $("#receiver").val(e.PMAJUA002)
      $("#PMABSITE").val(e.PMABSITE)
      $("#USER_SID").val(e.USER_SID)
    }
  })
  $("#purchaser").val(localStorage.getItem(PROJECT_SAVE_NAME+'_BI_userName'));


  // Retrieve the cart data from local storage
  var cartProductsJSON = localStorage.getItem('cartProducts');
  var cartProducts = cartProductsJSON ? JSON.parse(cartProductsJSON) : [];

  // Select the checkout list element
  var checkoutList = $('#checkoutList');

  // Initialize total quantity
  var totalQuantity = 0;

  // Loop through the cart items and dynamically generate the HTML
  cartProducts.forEach(function(product) {
    // Increment total quantity for each product
    totalQuantity += product.quantity;

    var listItem = `
    <li class="list-group-item d-flex justify-content-between lh-sm">
      <div class="col-7">
        <h6 class="my-0">${product.name}</h6>
      </div>
      <div class="col-5">
        <div class="text-end">
          <div class="col-12">${product.quantity}kg</div>
          <div style="font-wight: 100; font-size: 0.8rem">(滿桶: ${parseInt(product.quantity / product.unit)} 桶 / 未滿桶: ${product.quantity % product.unit} kg)</div>
        </div>
      </div>
    </li>
  `;

    // Append the generated list item to the checkout list
    checkoutList.append(listItem);

    // 填入確認送出彈出框
    $("#selected-product").append(`<p>${product.name} * ${product.quantity}kg</p>`)
  });

  // Calculate the total and update the total element
  var total = cartProducts.reduce(function(acc, product) {
    return acc + product.price * product.quantity;
  }, 0);

  var totalElement = `
    <li class="list-group-item d-flex justify-content-between bg-secondary">
      <div class="col-7">
        <span class="text-light">總計</span>
      </div>
      <div class="col-5">
        <div class="d-flex text-end">
            <span class="col-12 text-light">${totalQuantity}kg</span>
        </div>
      </div>
    </li>
  `;

  // Append the total element to the checkout list
  checkoutList.append(totalElement);

  // 填入確認送出彈出框
  // $("#total-price").append(`<strong>$${formatNumber(total)}</strong>`)

  //添加送出表單事件
  $('#Checkout').click(function(){
    if($('#receiver').val()===''){
      alert('收貨人不可空白!')
      return
    }
    //添加單頭
    requestBody = {
        "ADDRESS":$('#address').val(),
        "TOTAL_AMOUNT":total,
        "PMAA001":localStorage.getItem('subsidiary_code'),
        "CREATE_USER":localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO'),
        "PMABSITE": $("#PMABSITE").val() ,
        "PURCHASE_ORDER": $("#purchase-order").val(),
        "COMMENT":$("#remark").val(),
        "PMAJUA002":$("#receiver").val(),
        "ZZ_ORDER_RECORD_DETAIL":[]
    };
    //添加單身
    cartProducts.forEach(function(product) {
      var detail={
        "ZZ_PRODUCT_OVERVIEW_SID":product.sid,
        "QUANTITY_ORDERED":product.quantity,
        "PRICE":product.price,
        "TOTAL_AMOUNT":product.quantity * product.price,
        "DELIVERY_DATE":product.deliveryDate
      }
      requestBody["ZZ_ORDER_RECORD_DETAIL"].push(detail)
    })

    $("#exampleModal").modal('show')
  })

  $('#postOrder').click(function(){

      $.ajax({
          url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+ "/api/GENERATE_ORDER", // 替換為你的API端點
          type: 'POST',
          data: JSON.stringify(requestBody), // 将body对象转换为JSON字符串
          dataType: 'json',
          contentType: 'application/json',
          headers: {
              'TokenKey':localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
          },
          success: function(response) {
            if(response.result==true){
              updateReceiver()
              localStorage.removeItem('cartProducts') //清空購物車
              var ORDER_NUMBER = JSON.parse(response.Grid_Data)[0]["ORDER_NUMBER"]
              $('#order-number').text(ORDER_NUMBER)
              $('#successWrap').modal('show')
            }else{
              $('#errorMsg').text(response.Grid_Data)
              $('#failWrap').modal('show')
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
              console.error('Error:', textStatus, errorThrown);
              $('#postDataResult').text('Error: ' + textStatus + ', ' + errorThrown);
          }
      });


  })

});


function updateReceiver(){
  let username = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO')
  let SIDArray = `USER_SID=${$("#USER_SID").val()}`
  let EditVal = `PMAJUA002=N'${$("#receiver").val()}',`
  $.ajax({
    type: 'post',
    url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
    data: { funcName: "UpdGridData", TableName: "SEC_USER", SID: SIDArray, EditVal: EditVal, USER: username,SID_VAL:304100717100290,log_val : EditVal },
    dataType: 'json',
    async: false,
  });
}
// function initAddressOption(addressStr){
//   let options = addressStr.split(',').map((opt) => {
//     return `<option value="${opt}">${opt}</option>`;
//   });
//   return options.join('');
// }