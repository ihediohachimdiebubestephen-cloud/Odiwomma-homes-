document.addEventListener("DOMContentLoaded", function(){
  const menu = document.querySelector(".menu");
  const links = document.querySelector(".nav-links");
  if(menu && links){
    menu.addEventListener("click", function(){
      links.classList.toggle("open");
      menu.setAttribute("aria-expanded", links.classList.contains("open"));
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }

  const productGrid = document.querySelector("#product-grid");
  if(!productGrid) return;

  const products = [
    {id:"silk-paint",name:"Silk Paint",category:"painting",desc:"Smooth decorative paint suitable for creating a refined interior finish.",initial:"SP"},
    {id:"matt-emulsion-paint",name:"Matt Emulsion Paint",category:"painting",desc:"Matt-finish paint for interior walls and ceilings.",initial:"ME"},
    {id:"emulsion-paint",name:"Emulsion Paint",category:"painting",desc:"Versatile water-based paint for interior wall and ceiling applications.",initial:"EP"},
    {id:"textcoat-paint",name:"Textcoat Paint",category:"finishes",desc:"Textured coating for decorative and protective wall finishes.",initial:"TP"},
    {id:"gravitex-paint",name:"Gravitex Paint",category:"finishes",desc:"Textured decorative coating for distinctive wall surfaces and finishes.",initial:"GP"},
    {id:"primer",name:"Primer",category:"materials",desc:"Preparation coating used to help create a suitable surface before finishing.",initial:"PR"},
    {id:"oil-paint",name:"Oil Paint",category:"painting",desc:"Oil-based paint for suitable surfaces and finishing applications.",initial:"OP"},
    {id:"potty",name:"Potty",category:"materials",desc:"Material for wall preparation and surface finishing applications.",initial:"PT"},
    {id:"mineral-stone-paint",name:"Mineral Stone Paint",category:"finishes",desc:"Decorative stone-effect coating for distinctive wall surfaces.",initial:"MS"},
    {id:"screeding-paint",name:"Screeding Paint",category:"materials",desc:"Paint/coating option for prepared and screeded surfaces.",initial:"SC"}
  ];

  const cartKey = "odw_cart_v1";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(cartKey) || "[]"); } catch(e) { cart = []; }

  const search = document.querySelector("#shop-search");
  const category = document.querySelector("#shop-category");
  const cartDrawer = document.querySelector(".cart-drawer");
  const checkoutModal = document.querySelector("#checkout-modal");
  const checkoutBackdrop = document.querySelector("#checkout-backdrop");
  const checkoutForm = document.querySelector("#checkout-form");
  const checkoutSummary = document.querySelector("#checkout-summary");
  const checkoutWrap = document.querySelector("#checkout-form-wrap");
  const orderSuccess = document.querySelector("#order-success");

  function save(){ localStorage.setItem(cartKey, JSON.stringify(cart)); updateCart(); }
  function productById(id){ return products.find(p => p.id === id); }
  function count(){ return cart.reduce((n,i) => n + i.qty, 0); }

  function renderProducts(){
    const q = (search.value || "").trim().toLowerCase();
    const cat = category.value;
    const filtered = products.filter(p =>
      (cat === "all" || p.category === cat) &&
      (!q || (p.name + " " + p.desc).toLowerCase().includes(q))
    );

    productGrid.innerHTML = filtered.map(p => `
      <article class="product-card">
        <div class="product-visual"><span class="product-tag">${p.category}</span><span class="product-initial">${p.initial}</span></div>
        <div class="product-body">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="product-meta"><span class="quote-price">Price on request</span></div>
          <button class="btn product-add" type="button" data-add="${p.id}">Add to cart</button>
        </div>
      </article>`).join("");

    document.querySelector("#empty-products").hidden = filtered.length !== 0;
    productGrid.querySelectorAll("[data-add]").forEach(btn =>
      btn.addEventListener("click", () => addToCart(btn.dataset.add))
    );
  }

  function addToCart(id){
    const item = cart.find(i => i.id === id);
    if(item) item.qty += 1;
    else cart.push({id,qty:1});
    save();
    openCart();
  }

  function changeQty(id,delta){
    const item = cart.find(i => i.id === id);
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0) cart = cart.filter(i => i.id !== id);
    save();
  }

  function updateCart(){
    document.querySelectorAll(".cart-count").forEach(el => el.textContent = count());
    document.querySelector("#cart-total-items").textContent = count();

    const box = document.querySelector("#cart-items");
    const empty = document.querySelector("#cart-empty");
    if(!cart.length){
      box.innerHTML = "";
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    box.innerHTML = cart.map(i => {
      const p = productById(i.id);
      return `
        <div class="cart-row">
          <div>
            <h3>${p.name}</h3>
            <p>Price to be confirmed with OdiwommaHome</p>
            <div class="cart-controls">
              <button class="qty-btn" data-minus="${p.id}" type="button">−</button>
              <strong>${i.qty}</strong>
              <button class="qty-btn" data-plus="${p.id}" type="button">+</button>
              <button class="remove-item" data-remove="${p.id}" type="button">Remove</button>
            </div>
          </div>
          <strong>Quote</strong>
        </div>`;
    }).join("");

    box.querySelectorAll("[data-minus]").forEach(b => b.onclick = () => changeQty(b.dataset.minus,-1));
    box.querySelectorAll("[data-plus]").forEach(b => b.onclick = () => changeQty(b.dataset.plus,1));
    box.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => {
      cart = cart.filter(i => i.id !== b.dataset.remove);
      save();
    });
  }

  function openCart(){
    document.body.classList.add("cart-open");
    cartDrawer.setAttribute("aria-hidden","false");
  }

  function closeCart(){
    document.body.classList.remove("cart-open");
    cartDrawer.setAttribute("aria-hidden","true");
  }

  function openCheckout(){
    if(!cart.length){
      alert("Your cart is empty. Add an item first.");
      return;
    }

    checkoutSummary.innerHTML = `
      <div class="checkout-summary-title">Your selected items</div>
      ${cart.map(i => {
        const p = productById(i.id);
        return `<div class="checkout-summary-item"><span>${p.name}</span><strong>x${i.qty}</strong></div>`;
      }).join("")}
    `;

    checkoutWrap.hidden = false;
    orderSuccess.hidden = true;
    checkoutModal.setAttribute("aria-hidden","false");
    document.body.classList.add("checkout-open");
    closeCart();
    document.querySelector("#customer-name").focus();
  }

  function closeCheckout(){
    document.body.classList.remove("checkout-open");
    checkoutModal.setAttribute("aria-hidden","true");
  }

  document.querySelectorAll("[data-open-cart]").forEach(b => b.addEventListener("click", openCart));
  document.querySelectorAll("[data-close-cart]").forEach(b => b.addEventListener("click", closeCart));

  document.querySelector("#clear-cart").addEventListener("click", () => {
    cart = [];
    save();
  });

  document.querySelector("#checkout-order").addEventListener("click", openCheckout);
  document.querySelector("#checkout-close").addEventListener("click", closeCheckout);
  checkoutBackdrop.addEventListener("click", closeCheckout);
  document.querySelector("#success-close").addEventListener("click", closeCheckout);

  checkoutForm.addEventListener("submit", function(e){
    e.preventDefault();
    if(!cart.length){
      alert("Your cart is empty. Add an item first.");
      closeCheckout();
      return;
    }

    const name = document.querySelector("#customer-name").value.trim();
    const phone = document.querySelector("#customer-phone").value.trim();
    const address = document.querySelector("#customer-address").value.trim();
    const note = document.querySelector("#customer-note").value.trim();

    if(!name || !phone || !address) return;

    const lines = cart.map(i => {
      const p = productById(i.id);
      return `• ${p.name} x${i.qty}`;
    });

    const message = [
      "Hello OdiwommaHome, I would like to place an order / request a quote.",
      "",
      `Customer name: ${name}`,
      `Phone: ${phone}`,
      `Delivery address: ${address}`,
      "",
      "Selected items:",
      ...lines,
      "",
      note ? `Order note: ${note}` : "",
      "Please confirm availability, pricing, delivery and payment details. Thank you."
    ].filter(Boolean).join("\n");

    const whatsappUrl = `https://wa.me/2349046193188?text=${encodeURIComponent(message)}`;

    checkoutWrap.hidden = true;
    orderSuccess.hidden = false;

    window.open(whatsappUrl, "_blank");
  });

  search.addEventListener("input", renderProducts);
  category.addEventListener("change", renderProducts);

  renderProducts();
  updateCart();
});
