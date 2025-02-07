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

  const create_InventoryItem = (itemDetails) => {
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


    listItem.append(contentSpan, subtractBtn, amountSpan, addBtn, addToCartBtn);

    return listItem;
  }

  const create_CartItem = (itemDetails) => {
    console.log(`itemdetails: ${itemDetails.content}`);
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

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "cart__delete-btn";
    const editBtn = document.createElement("button");
    editBtn.className = "cart__edit-btn";

    contentSpan.append(document.createTextNode(itemDetails.content));
    contentAdjSpan.append(document.createTextNode("X"));
    amountSpan.append(document.createTextNode(itemDetails.amount));
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
    editableWrapperDiv.append(contentSpan.cloneNode(true), subtractBtn, amountSpan.cloneNode(true), addBtn, saveBtn);

    listItem.append(wrapperDiv, editableWrapperDiv);

    //Adding listeners
    deleteBtn.addEventListener("click", () => {
      Model.deleteFromCart(itemDetails.id);
    });
    editBtn.addEventListener("click", () => {
      wrapperDiv.style.display = "flex" ? "none" : "flex";
      editableWrapperDiv.style.display = "none" ? "flex" : "none";
    });
    addBtn.addEventListener("click", () => {
      Model.updateCart(itemDetails.id, itemDetails.amount + 1);
    });
    subtractBtn.addEventListener("click", () => {
      Model.updateCart(itemDetails.id, itemDetails.amount - 1);
    });
    saveBtn.addEventListener("click", () => {
      wrapperDiv.classList.toggle("hidden");
      editableWrapperDiv.classList.toggle("hidden");
    });

    return listItem;
  }

  const renderLists = (inventory, cart) => {
    inventory_list_el.innerHTML = "";
    // cart_list_el.innerHTML = "";
    console.log("inventory is ", inventory);
    console.log("cart is ", cart);
    inventory.forEach(item => {
      inventory_list_el.append(create_InventoryItem(item));
    });
    cart.forEach(item => {
      cart_list_el.append(create_CartItem(item));
    })
  }
  return {
    renderLists
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const handleAddToCart = () => { };

  const handleEdit = (event) => {
    event.preventDefault();
  };

  const handleEditAmount = () => { };

  const handleDelete = () => { };

  const handleCheckout = () => { };

  const init = () => {

    state.subscribe(() => {
      View.renderLists(state.inventory, state.cart);
    });
    
    model.getInventory().then((data) => {
      console.log("inventory is ", data);
      state.inventory = data;
    });
    model.getCart().then((data) => {
      console.log("cart is ", data);
      state.cart = data;
    });
  };
  // Model.getCart().then((data) => {
  //   console.log(data);
  // })

  let newItem = {
    "id": 3,
    "content": "banana",
    "amount": 2
  }
  // Model.addToCart(newItem).then((data) => {
  //   console.log(data);
  // }).catch((err) => {
  //   console.log(err);
  // })

  return {
    init,
  };
})(Model, View);

Controller.init();
