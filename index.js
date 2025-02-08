const API = (() => {
  const URL = "http://localhost:3000";
  const getCart = () => {
    // define your method to get cart data
    return fetch(`${URL}/cart`).then((res) => res.json());
  };

  const getInventory = () => {
    // define your method to get inventory data
    return fetch(`${URL}/inventory`).then((res) => res.json());
  };

  const addToCart = (inventoryItem) => {
    // define your method to add an item to cart
    return fetch(`${URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inventoryItem),
    }).then((res) => res.json());
  };

  const updateCart = (id, newAmount) => {
    // define your method to update an item in cart
    return fetch(`${URL}/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          "amount": newAmount
        }
      ),
    }).then((res) => res.json());
  };

  const deleteFromCart = (id) => {
    // define your method to delete an item in cart
    return fetch(`${URL}/cart/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(),
    }).then((res) => res.json());
  };

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange();
    }

    set inventory(newInventory) {
      this.#inventory = newInventory;
      this.#onChange();
    }

    subscribe(cb) {
      this.#onChange = cb;
    }
  }

  return {
    State,
    ...API,
  };
})();

const View = (() => {
  // implement your logic for View
  //Lists
  const inventory_list_el = document.querySelector(".inventory__list");
  const cart_list_el = document.querySelector(".cart__list");
  const checkoutBtn = document.querySelector(".checkout-btn");

  const create_InventoryItem = (itemDetails, handleAddToCart) => {
    // Constructing below list item
    // <li class="inventory__item">
    //   <span class="inventory__item-content">apple</span>
    //   <button class="inventory__add-btn">-</button>
    //   <span class="inventory__item-amount">0</span>
    //   <button class="inventory__subtract-btn">+</button>
    //   <button class="add-to-cart-btn">add to cart</button>
    // </li>
    
    const listItem = document.createElement("li");
    listItem.id = itemDetails.id;
    listItem.className = "inventory__item";

    const contentSpan = document.createElement("span");
    contentSpan.className = "inventory__item-content";
    const amountSpan = document.createElement("span");
    amountSpan.className = "inventory__item-amount";

    const addBtn = document.createElement("button");
    addBtn.className = "inventory__add-btn";
    const subtractBtn = document.createElement("button");
    subtractBtn.className = "inventory__subtract-btn";
    const addToCartBtn = document.createElement("button");
    addToCartBtn.className = "add-to-cart-btn";

    contentSpan.append(document.createTextNode(itemDetails.content));
    amountSpan.append(document.createTextNode(0));
    addBtn.append(document.createTextNode("+"));
    subtractBtn.append(document.createTextNode("-"));
    addToCartBtn.append(document.createTextNode("add to cart"));

    //Adding listeners
    addBtn.addEventListener("click", () => {
      let amount = parseInt(amountSpan.textContent);
      amountSpan.textContent = (++amount).toString();
    });
    subtractBtn.addEventListener("click", () => {
      let amount = parseInt(amountSpan.textContent);
      if (amount <= 0) return;
      amountSpan.textContent = (--amount).toString();
    });
    addToCartBtn.addEventListener("click", () => {
      let amount = parseInt(amountSpan.textContent);
      if (amount <= 0) return;
      handleAddToCart({ ...itemDetails, amount: amount });
      amountSpan.textContent = 0;
    });

    listItem.append(contentSpan, subtractBtn, amountSpan, addBtn, addToCartBtn);

    return listItem;
  }

  const create_CartItem = (itemDetails, handleEdit, handleDelete) => {
    // Constructing below list item
    // <li id="1" class="cart__item">
    //   <div class="cart__item-wrapper" style="display: none;"><span
    //     class="cart__item-content">apple</span><span>x</span><span class="cart__item-amount">3</span><button
    //       class="cart__delete-btn">delete</button><button class="cart__edit-btn">edit</button></div>
    //   <div class="cart__edit-item-wrapper" style="display: flex;"><span
    //     class="cart__item-content">apple</span><button class="cart__subtract-btn">-</button><span
    //       class="cart__item-amount">3</span><button class="cart__add-btn">+</button><button
    //         class="cart__save-btn">save</button></div>
    // </li>

    const listItem = document.createElement("li");
    listItem.id = itemDetails.id;
    listItem.className = "cart__item";

    //Normal state
    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "cart__item-wrapper";

    const contentSpan = document.createElement("span");
    contentSpan.className = "cart__item-content";
    const contentAdjSpan = document.createElement("span");
    const amountSpan = document.createElement("span");
    amountSpan.className = "cart__item-amount";
    const editAmountSpan = document.createElement("span");
    editAmountSpan.className = "cart__item-amount";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "cart__delete-btn";
    const editBtn = document.createElement("button");
    editBtn.className = "cart__edit-btn";

    contentSpan.append(document.createTextNode(itemDetails.content));
    contentAdjSpan.append(document.createTextNode("x"));
    amountSpan.append(document.createTextNode(itemDetails.amount));
    editAmountSpan.append(document.createTextNode(itemDetails.amount));
    deleteBtn.append(document.createTextNode("delete"));
    editBtn.append(document.createTextNode("edit"));

    //Edit state
    const editableWrapperDiv = document.createElement("div");
    editableWrapperDiv.className = "cart__edit-item-wrapper";

    const addBtn = document.createElement("button");
    addBtn.className = "cart__add-btn";
    const subtractBtn = document.createElement("button");
    subtractBtn.className = "cart__subtract-btn";
    const saveBtn = document.createElement("button");
    saveBtn.className = "cart__save-btn";

    addBtn.append(document.createTextNode("+"));
    subtractBtn.append(document.createTextNode("-"));
    saveBtn.append(document.createTextNode("save"));

    wrapperDiv.append(contentSpan, contentAdjSpan, amountSpan, deleteBtn, editBtn);
    editableWrapperDiv.append(contentSpan.cloneNode(true), subtractBtn, editAmountSpan, addBtn, saveBtn);

    listItem.append(wrapperDiv, editableWrapperDiv);

    //Adding listeners
    editBtn.addEventListener("click", () => {
      wrapperDiv.style.display = "flex" ? "none" : "flex";
      editableWrapperDiv.style.display = "none" ? "flex" : "none";
    });
    deleteBtn.addEventListener("click", () => {
      handleDelete(itemDetails.id);
    });
    addBtn.addEventListener("click", () => {
      let amount = parseInt(editAmountSpan.textContent);
      editAmountSpan.textContent = (++amount).toString();
    });
    subtractBtn.addEventListener("click", () => {
      let amount = parseInt(editAmountSpan.textContent);
      if (amount <= 0) return;
      editAmountSpan.textContent = (--amount).toString();
    });
    saveBtn.addEventListener("click", () => {
      handleEdit({ ...itemDetails, amount: parseInt(editAmountSpan.textContent) });
    });

    return listItem;
  }

  const renderLists = (inventory, cart, handleFuncs) => {
    inventory_list_el.innerHTML = "";
    cart_list_el.innerHTML = "";
    inventory.forEach(item => {
      inventory_list_el.append(create_InventoryItem(item, handleFuncs.handleAddToCart));
    });
    cart.forEach(item => {
      cart_list_el.append(create_CartItem(item, handleFuncs.handleEditAmount, handleFuncs.handleDelete));
    });
    checkoutBtn.addEventListener("click", handleFuncs.handleCheckout);

  }
  return {
    renderLists
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const handleAddToCart = (item) => {
    let itemExists = state.cart.find((cartItem) => cartItem.id === item.id);
    if (itemExists) {
      return handleEditAmount({...item, amount: itemExists.amount + item.amount});
    }
    else {
      model.addToCart(item).then((data) => {
        state.cart = [...state.cart, data];
        console.log(data);
      }).catch((err) => {
        console.log(err);
      });
    }
  };

  const handleEditAmount = (item) => {
    if(item.amount <= 0) 
      return handleDelete(item.id);
    model.updateCart(item.id, item.amount).then((data) => {
      state.cart = state.cart.map((item) => item.id === data.id ? data : item);
      console.log("update is:", data)
    }).catch((err) => {
      console.log(err);
    });
  };

  const handleDelete = (id) => {
    model.deleteFromCart(id).then((data) => {
      state.cart = state.cart.filter((item) => item.id !== id);
      console.log(data);
    }).catch((err) => {
      console.log(err);
    });
  };

  const handleCheckout = () => {
    model.checkout().then((data) => {
      console.log(data);
      state.cart = [];
      alert("checkout successful");
    })
  };

  const handleFuncs = {
    handleAddToCart,
    handleEditAmount,
    handleDelete,
    handleCheckout
  };

  const init = () => {
    state.subscribe(() => {
      if (state.inventory.length === 0) return;
      view.renderLists(state.inventory, state.cart, handleFuncs);
      console.log("State change : ", state.inventory, state.cart);
    });
    Promise.all([model.getInventory(), model.getCart()]).then((data) => {
      state.cart = data[1];
      state.inventory = data[0];
    })
  };

  return {
    init,
  };
})(Model, View);

Controller.init();
