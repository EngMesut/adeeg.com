class Cart {
  constructor() {
    this.items = [];
    this.total = 0;
    this.loadFromLocalStorage(); // Load items from localStorage instead of clearing it
  }

  clearLocalStorage() {
    localStorage.removeItem("cart");
    localStorage.removeItem("lastReceipt");
  }

  addItem(name, price) {
    const existingItem = this.items.find((item) => item.name === name);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.items.push({ name, price, quantity: 1, selected: true });
    }
    this.updateTotal();
    this.saveToLocalStorage();
    this.updateCart();
  }

  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.updateTotal();
      this.saveToLocalStorage();
      this.updateCart();
    }
  }

  updateItemQuantity(index, quantity) {
    if (index >= 0 && index < this.items.length) {
      this.items[index].quantity = Math.max(0, quantity);
      if (this.items[index].quantity === 0) {
        this.removeItem(index);
      } else {
        this.updateTotal();
        this.saveToLocalStorage();
        this.updateCart();
      }
    }
  }

  updateTotal() {
    this.total = this.items.reduce(
      (sum, item) => (item.selected ? sum + item.price * item.quantity : sum),
      0
    );
  }

  saveToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(this.items));
  }

  loadFromLocalStorage() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      this.items = JSON.parse(savedCart);
      this.updateTotal(); // Recalculate the total based on the loaded items
    }
  }

  updateCart() {
    const cartDropdownItems = document.getElementById("cartDropdownItems");
    const cartDropdownTotal = document.getElementById("cartDropdownTotal");
    const cartItemCount = document.getElementById("cartItemCount");

    if (cartDropdownItems) {
      cartDropdownItems.innerHTML = "";
      this.items.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
          <div class="cart-item-details">
            <input type="checkbox" class="form-check-input me-2 select-item" data-index="${index}" ${
          item.selected ? "checked" : ""
        }>
            <span>${item.name}</span>
            <span class="text-muted">$${item.price.toFixed(2)}</span>
          </div>
          <div class="cart-item-actions">
            <input type="number" class="form-control form-control-sm cart-item-quantity" value="${
              item.quantity
            }" min="1" data-index="${index}">
            <button class="btn btn-danger btn-sm remove-item" data-index="${index}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        `;
        cartDropdownItems.appendChild(li);
      });
      cartDropdownItems.innerHTML += `
        <li>
          <button id="payButton" class="btn btn-success w-100">Pay Now</button>
        </li>
      `;
    }

    if (cartDropdownTotal) {
      cartDropdownTotal.textContent = this.total.toFixed(2);
    }

    if (cartItemCount) {
      cartItemCount.textContent = this.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    }
  }

  toggleItemSelection(index) {
    if (index >= 0 && index < this.items.length) {
      this.items[index].selected = !this.items[index].selected;
      this.updateTotal();
      this.saveToLocalStorage();
      this.updateCart();
    }
  }

  clearCart() {
    this.items = [];
    this.total = 0;
    this.saveToLocalStorage();
    this.updateCart();
  }
}

const cart = new Cart();

document.addEventListener("DOMContentLoaded", () => {
  cart.updateCart();

  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".card");
      const productName = card.querySelector(".card-title").textContent;
      const productPrice = parseFloat(
        card.querySelector(".price-tag").textContent.slice(1)
      );
      cart.addItem(productName, productPrice);
    });
  });

  const cartDropdownItems = document.getElementById("cartDropdownItems");
  if (cartDropdownItems) {
    cartDropdownItems.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("remove-item") ||
        e.target.closest(".remove-item")
      ) {
        const index = parseInt(
          e.target.closest(".remove-item").getAttribute("data-index")
        );
        cart.removeItem(index);
      }
    });

    cartDropdownItems.addEventListener("change", (e) => {
      if (e.target.classList.contains("cart-item-quantity")) {
        const index = parseInt(e.target.getAttribute("data-index"));
        const quantity = parseInt(e.target.value);
        cart.updateItemQuantity(index, quantity);
      } else if (e.target.classList.contains("select-item")) {
        const index = parseInt(e.target.getAttribute("data-index"));
        cart.toggleItemSelection(index);
      }
    });
  }

  cartDropdownItems.addEventListener("click", (e) => {
    if (e.target && e.target.id === "payButton") {
      const selectedItems = cart.items.filter((item) => item.selected);
      if (selectedItems.length > 0) {
        const receiptData = {
          items: selectedItems,
          total: cart.total,
        };
        localStorage.setItem("lastReceipt", JSON.stringify(receiptData));

        // Remove paid items from the cart
        cart.items = cart.items.filter((item) => !item.selected);
        cart.saveToLocalStorage();
        cart.updateCart();
        console.log("Remaining items in the cart:", cart.items); // Debug log
        console.log("Paid items:", selectedItems);
        window.location.href = "/src/receipt.html";
      } else {
        alert("Please select items to pay for.");
      }
    }
  });
});
