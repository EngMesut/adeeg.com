document.addEventListener("DOMContentLoaded", () => {
  const receiptData = JSON.parse(localStorage.getItem("lastReceipt"));
  const receiptContent = document.getElementById("receiptContent");

  if (receiptData && receiptData.items && receiptData.items.length > 0) {
    let receiptHTML = '<table class="table">';
    receiptHTML +=
      "<thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead>";
    receiptHTML += "<tbody>";

    receiptData.items.forEach((item) => {
      receiptHTML += `<tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>`;
    });

    receiptHTML += "</tbody>";
    receiptHTML += `<tfoot>
                    <tr>
                        <th colspan="3" class="text-end">Total:</th>
                        <th>$${receiptData.total.toFixed(2)}</th>
                    </tr>
                </tfoot>`;
    receiptHTML += "</table>";

    // Add date and time to the receipt
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString();
    const timeString = currentDate.toLocaleTimeString();
    receiptHTML += `<p class="text-end mt-3">Date: ${dateString} Time: ${timeString}</p>`;

    receiptContent.innerHTML = receiptHTML;

    // Clear the lastReceipt from localStorage after displaying
    localStorage.removeItem("lastReceipt");
  } else {
    receiptContent.innerHTML =
      '<p class="text-center">No receipt data available.</p>';
  }

  const printButton = document.getElementById("printButton");
  printButton.addEventListener("click", () => {
    window.print();
  });
});
