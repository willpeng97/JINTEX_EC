//準備API參數
var orderDetailGridSID = '351521969063605'; //V_ZZ_ORDER_RECORD_DETAIL
var orderDetailGrid;
var cartProducts;

// URL取參
var currentURL = new URL(window.location.href);
var URLparams = new URLSearchParams(currentURL.search);
var ORDER_NUMBER = URLparams.get('order');
var ZZ_ORDER_RECORD_SID = URLparams.get('sid');
$("#ec-no").text(ORDER_NUMBER)

// 獲取當天日期
var today = (new Date()).toLocaleDateString('en-CA');

async function fetchData() {
  orderDetailGrid = await getGridDataOrderDetail(orderDetailGridSID,ZZ_ORDER_RECORD_SID)
  //組table資料
  cartProducts = orderDetailGrid.map(function(detail) {
    return {
      sid: detail.ZZ_PRODUCT_OVERVIEW_SID,
      item: detail.CUSTOMER_ITEM_NO,
      name: detail.ITEM_NATIVE_NAME,
      name_en: detail.ITEM_ENG_NAME,
      unit: detail.WEIGHT,
      price: detail.PRICE||1,
      quantity: detail.QUANTITY_ORDERED,
      INVAIL_FLAG: detail.INVAIL_FLAG,
      EXPORT_LOCK_FLAG: detail.EXPORT_LOCK_FLAG,
      deliveryDate: detail.DELIVERY_DATE.split('T')[0],
      comment: detail.COMMENT||"無",
    };
  });
  displayCartProducts();
};
fetchData()

// Function to display cart products, update total items, and calculate total price
function displayCartProducts() {
  // Clear the previous content
  $('#cartProducts').empty();

  // 在数据加载完成后执行其他逻辑
  var isEditable = true
  cartProducts.forEach(function (cartProduct) {
    if(cartProduct.INVAIL_FLAG === 'N' && cartProduct.EXPORT_LOCK_FLAG === 'Y'){
      isEditable =  false
      
      var productHtml = `
        <tr>
          <td>${cartProduct.deliveryDate}</td>
          <td>${cartProduct.name_en}</td>
          <td>${cartProduct.name}</td>
          <td>
            <div>${cartProduct.quantity}kg</div>
            <div style="font-wight: 100; font-size: 0.8rem">(滿桶: ${parseInt(cartProduct.quantity / cartProduct.unit)} 桶 / 未滿桶: ${cartProduct.quantity % cartProduct.unit} kg)</div>
          </td>
          <td>訂單審核中</td>
        </tr>
      `;
      $('#cartProducts').append(productHtml);

      $("#commentText").text(cartProduct.comment)
    }else if(cartProduct.INVAIL_FLAG === 'N'){
      var productHtml = `
        <tr>
          <td><input type="date" min="${today}" onchange="updateDeliveryDate(this,'${cartProduct.sid}')" value="${cartProduct.deliveryDate}"></td>
          <td>${cartProduct.name_en}</td>
          <td>${cartProduct.name}</td>
          <td>
            <div>${cartProduct.quantity}kg</div>
            <div style="font-wight: 100; font-size: 0.8rem">(滿桶: ${parseInt(cartProduct.quantity / cartProduct.unit)} 桶 / 未滿桶: ${cartProduct.quantity % cartProduct.unit} kg)</div>
          </td>
          <td class="actionBtn d-flex justify-content-end">
            <button onclick="openDeleteDetailModal(${cartProduct.sid})" class="btn btn-danger">
              <img src="../img/comm/FontAwesome/trash-solid.svg" alt="remove" />
            </button>
            <button onclick="openEditModal('${cartProduct.sid}')" class="btn btn-success">
              <img src="../img/comm/FontAwesome/pen-to-square-solid.svg" alt="edit" />
            </button>
          </td>
        </tr>
      `;
      $('#cartProducts').append(productHtml);
      $("#commentText").text(cartProduct.comment)
      
    }
  });

  if(isEditable) $("#cancelBtn").show()

  // Update the total number of items
  $('#totalItems').text(getTotalItems(cartProducts));
}

// Function to get the total number of items in the cart
function getTotalItems(products) {
  return products.reduce(function (acc, product) {
    if (product.INVAIL_FLAG === 'Y'){
      return acc
    }else{
      return acc + product.quantity;
    }
  }, 0);
}

// Function to calculate the total price of items in the cart
function getTotalPrice(products) {
  return products.reduce(function (acc, product) {
    if (product.INVAIL_FLAG === 'Y'){
      return acc
    }else{
      return acc + product.price * product.quantity;
    }
  }, 0);
}
//刪除一個
function openDeleteDetailModal(productSid) {
  // Set the product ID in the modal for reference
  $('#deleteDetailConfirmationModal').data('product-sid', productSid);

  // Open the modal
  $('#deleteDetailConfirmationModal').modal('show');
}
function deleteDetail() {
  // Retrieve the product ID stored in the modal
  var productSid = $('#deleteDetailConfirmationModal').data('product-sid');

  var existingProduct = cartProducts.find(product => product.sid == productSid);

  if (existingProduct) {
    // 保存修改
    existingProduct.INVAIL_FLAG = 'Y';
    EditOrder()
    // Display updated cart products
    displayCartProducts();
  }

  // Close the modal
  $('#deleteDetailConfirmationModal').modal('hide');
}
// Function to open the edit quantity modal
function openEditModal(productSid) {
  // Retrieve the current quantity from the product object
  var existingProduct = cartProducts.find(product => product.sid == productSid);
  var currentQuantity = existingProduct ? existingProduct.quantity : 0;
  var step = existingProduct.unit

  // Set the product ID in the modal for reference
  $('#editQuantityModal').data('product-sid', productSid);

  // Add the plus and minus buttons
  $('#editQuantityModal .modal-body').html(`
    <label for="newQuantity">淨重(kg):</label>
    <div class="input-group">
      <input type="number" id="newQuantity" class="form-control" value="${currentQuantity}" min="${step}" step="${step}" onchange="formatQuantity(this)">
    </div>
  `);

  // Open the modal
  $('#editQuantityModal').modal('show');
}

// Function to update the quantity
function updateQuantity() {
  // Retrieve the product ID stored in the modal
  var productSid = $('#editQuantityModal').data('product-sid');

  // Retrieve the new quantity from the modal input
  var newQuantity = parseInt($('#editQuantityModal #newQuantity').val());

  if (!isNaN(newQuantity) && newQuantity >= 0) {
    var existingProduct = cartProducts.find(product => product.sid == productSid);

    if (existingProduct) {
      // 保存修改
      existingProduct.quantity = newQuantity;
      EditOrder()

      // Display updated cart products
      displayCartProducts();

      // Close the modal
      $('#editQuantityModal').modal('hide');
    }
  } else {
    // Handle invalid input, show an alert, or take appropriate action
    alert('Please enter a valid quantity.');
  }
}
// 更新預計交貨日期
function updateDeliveryDate(input,productSid){
  var existingProduct = cartProducts.find(product => product.sid == productSid);
  existingProduct.deliveryDate = input.value
  EditOrder()
}
function getGridDataOrderDetail(SID,ZZ_ORDER_RECORD_SID) {
  return new Promise((resolve, reject) => {
      // 定义 GetGrid API 的 URL
      let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetData';

      // 定义查詢条件参数对象
      let conditions = {
          Field: ["ZZ_ORDER_RECORD_SID"],
          Oper: ["="],
          Value: [ZZ_ORDER_RECORD_SID]
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
                  // Set_Clean();
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

function EditOrder() {
  // 檢查交貨日是否有輸入
  for (let product of cartProducts) {
    if (!product.deliveryDate) {
      alert("請選擇預計交貨日!")
      return;
    }
  }

  let orderDetails = cartProducts.map(function(item){
    return {
      ZZ_PRODUCT_OVERVIEW_SID: item.sid,
      QUANTITY_ORDERED: item.quantity,
      PRICE: item.price,
      TOTAL_AMOUNT: item.quantity * item.price,
      INVAIL_FLAG: item.INVAIL_FLAG,
      DELIVERY_DATE: item.deliveryDate
    }
  })
  let body = {
     "SO":ORDER_NUMBER,//訂單-客戶看的
      "ZZ_ORDER_RECORD_SID":ZZ_ORDER_RECORD_SID, //訂單SID
      "LOGIN_USER": localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO'),//登入者[修改訂單者]
      "ZZ_ORDER_RECORD_DETAIL":orderDetails
  };
  
  $.ajax({
      url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/OPI_ORDER',
      type: 'PUT',
      data: JSON.stringify(body), // 将body对象转换为JSON字符串
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
      },
      success: function(response) {
        alert('訂單已完成修改!')
        // location.reload()
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Error:', textStatus, errorThrown);
        $('#postDataResult').text('Error: ' + textStatus + ', ' + errorThrown);
      }
  });

}
function DeleteOrder(){
  let body = {
      "ZZ_ORDER_RECORD_SID": ZZ_ORDER_RECORD_SID,
      "LOGIN_USER": localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO')
  };
  
  $.ajax({
      url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/DELETE_EC',
      type: 'DELETE',
      data: JSON.stringify(body), // 将body对象转换为JSON字符串
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
      },
      success: function(response) {
        $('#deleteOrderConfirmationModal').modal('hide')
        alert('訂單已刪除!')
        window.location.href = './orderQuery.html'
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Error:', textStatus, errorThrown);
        $('#postDataResult').text('Error: ' + textStatus + ', ' + errorThrown);
      }
  });
}