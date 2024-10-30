// Retrieve the array of products from local storage
var cartProductsJSON = localStorage.getItem('cartProducts');
var cartProducts = cartProductsJSON ? JSON.parse(cartProductsJSON) : [];
// 獲取當天日期
var today = (new Date()).toLocaleDateString('en-CA');

// Call the displayCartProducts function to show cart products on page load
$(document).ready(function () {
  displayCartProducts();
  $("#checkout").click(function () {
    // 狀況1: 購物車為空
    if (cartProducts.length == 0) {
      $("#failWrap").modal("show");
      return
    }
    // 狀況2: 沒有輸入預計交貨日
    for (let product of cartProducts) {
      if (!product.deliveryDate) {
        alert("請選擇預計交貨日!")
        return;
      }
    }
    // 狀況3: 有未滿桶的數量
    for (let product of cartProducts) {
      if (product.quantity % product.unit > 0) {
        let answer = confirm('訂單含有未滿桶的數量，仍要繼續嗎?');
        if(answer){
          location.href = "../zz_query/checkout.html";
          return
        }else{
          return;
        }
      }
    }
    // 狀況4: 進入結帳頁面
    location.href = "../zz_query/checkout.html";
  });
});

// Function to display cart products, update total items, and calculate total price
function displayCartProducts() {
  var cartProductsContainer = $('#cartProducts');
  var totalItemsSpan = $('#totalItems');
  // var totalPriceSpan = $('#totalPrice');

  // Clear the previous content
  cartProductsContainer.empty();

  // 在数据加载完成后执行其他逻辑
  cartProducts.forEach(function (cartProduct) {
    // var productHtml = `
    //   <tr>
    //     <td><input type="date" min="${today}" onchange="updateDeliveryDate(this,'${cartProduct.sid}')" value="${cartProduct.deliveryDate}"></td>
    //     <td>${cartProduct.name_en}</td>
    //     <td>${cartProduct.name}</td>
    //     <td>${cartProduct.quantity}kg</td>
    //     <td class="text-end">$${formatNumber(cartProduct.quantity * cartProduct.price)}</td>
    //     <td class="d-flex justify-content-end">
    //       <button onclick="removeFromCart('${cartProduct.sid}')" class="btn btn-danger">
    //         <img src="../img/comm/FontAwesome/trash-solid.svg" alt="remove" />
    //       </button>
    //       <button onclick="openEditModal('${cartProduct.sid}')" data-product-sid="${cartProduct.sid}" class="btn btn-success" >
    //         <img src="../img/comm/FontAwesome/pen-to-square-solid.svg" alt="edit" />
    //       </button>
    //     </td>
    //   </tr>
    // `;
    let alertTag = `<spna><img title="含有未滿桶的數量 !" style="margin-left:10px; height:1.2rem; cursor:help" src="../img/weyu/alert-triangle.svg"></sapn>`
    let productHtml = `
      <tr>
        <td><input type="date" min="${today}" onchange="updateDeliveryDate(this,'${cartProduct.sid}')" value="${cartProduct.deliveryDate}"></td>
        <td>${cartProduct.name_en}</td>
        <td>${cartProduct.name}</td>
        <td>${cartProduct.unit}kg</td>
        <td>
          <div>${cartProduct.quantity}kg${cartProduct.quantity % cartProduct.unit > 0 ? alertTag : ''}</div>
          <div style="font-wight: 100; font-size: 0.8rem">(滿桶: ${parseInt(cartProduct.quantity / cartProduct.unit)} 桶 / 未滿桶: ${cartProduct.quantity % cartProduct.unit} kg)</div>
        </td>
        <td class="d-flex justify-content-end">
          <button onclick="removeFromCart('${cartProduct.sid}')" class="btn btn-danger">
            <img src="../img/comm/FontAwesome/trash-solid.svg" alt="remove" />
          </button>
          <button onclick="openEditModal('${cartProduct.sid}')" data-product-sid="${cartProduct.sid}" class="btn btn-success" >
            <img src="../img/comm/FontAwesome/pen-to-square-solid.svg" alt="edit" />
          </button>
        </td>
      </tr>
    `;
    cartProductsContainer.append(productHtml);
  });


  // Update the total number of items
  totalItemsSpan.text(getTotalItems(cartProducts));

  // Calculate the total price of items in the cart
  // var total = getTotalPrice(cartProducts);

  // Update the total price display
  // totalPriceSpan.text(formatNumber(total));
}

// Function to remove a product from the cart
function removeFromCart(productSid) {

  openDeleteConfirmationModal(productSid);

  
}

// Function to clear the entire cart
function clearCart() {
  // Clear the cartProducts array
  cartProducts = [];

  // Update the cartProducts array in local storage
  var cartProductsUpdatedJSON = JSON.stringify(cartProducts);
  localStorage.setItem('cartProducts', cartProductsUpdatedJSON);

  // Display an empty cart
  displayCartProducts();
}

// Function to get the total number of items in the cart
function getTotalItems(products) {
  return products.reduce(function (acc, product) {
    return acc + product.quantity;
  }, 0);
}

// Function to calculate the total price of items in the cart
function getTotalPrice(products) {
  return products.reduce(function (acc, product) {
    return acc + product.price * product.quantity;
  }, 0);
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
      <input type="number" id="newQuantity" class="form-control" value="${currentQuantity}" min="${step}" step="${step}">
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
      // Update the quantity
      existingProduct.quantity = newQuantity;

      // Update the cartProducts array in local storage
      var cartProductsUpdatedJSON = JSON.stringify(cartProducts);
      localStorage.setItem('cartProducts', cartProductsUpdatedJSON);

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
  // Update the cartProducts array in local storage
  var cartProductsUpdatedJSON = JSON.stringify(cartProducts);
  localStorage.setItem('cartProducts', cartProductsUpdatedJSON);
  
}




//刪除一個
function openDeleteConfirmationModal(productSid) {
  // Set the product ID in the modal for reference
  $('#deleteConfirmationModal').data('product-sid', productSid);

  // Open the modal
  $('#deleteConfirmationModal').modal('show');
}

function deleteItemConfirmed() {
  // Retrieve the product ID stored in the modal
  var productSid = $('#deleteConfirmationModal').data('product-sid');

  // Implement your delete logic here (similar to removeFromCart)
  // Find the index of the product in the cartProducts array
  var index = cartProducts.findIndex(product => product.sid == productSid);

  // Remove the product from the cartProducts array
  if (index !== -1) {
    cartProducts.splice(index, 1);

    // Update the cartProducts array in local storage
    var cartProductsUpdatedJSON = JSON.stringify(cartProducts);
    localStorage.setItem('cartProducts', cartProductsUpdatedJSON);

    // Display updated cart products
    displayCartProducts();
  }


  // Close the modal
  $('#deleteConfirmationModal').modal('hide');
}

//刪除全部
function openClearCartConfirmationModal() {
    // Open the modal
    $('#clearCartConfirmationModal').modal('show');
}
  
function confirmClearCart() {
  // Implement your clear cart logic here (similar to clearCart)

  // Close the modal
  $('#clearCartConfirmationModal').modal('hide');
}
  
function clearCartConfirmed(){
    for(var i=0 ; i<cartProducts.length;i++){
      // Update the cartProducts array in local storage
      var cartProductsUpdatedJSON = JSON.stringify(cartProducts[i]);
      localStorage.removeItem('cartProducts', cartProductsUpdatedJSON);

    }

    // Close the modal
    location.reload();
}