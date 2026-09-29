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
    {id:"interior-paint",name:"Interior Painting",category:"painting",desc:"Professional interior painting for rooms, apartments, offices and living spaces.",initial:"IP"},
    {id:"exterior-paint",name:"Exterior Painting",category:"painting",desc:"Exterior painting for walls, facades and other outdoor surfaces. Request a project quote.",initial:"EP"},
    {id:"decorative-finish",name:"Decorative Wall Finish",category:"finishes",desc:"Decorative and textured wall finishes for feature walls and statement spaces.",initial:"DF"},
    {id:"wall-preparation",name:"Wall Preparation",category:"materials",desc:"Surface preparation, repairs and priming before painting or decorative finishing.",initial:"WP"},
    {id:"colour-consultation",name:"Colour Consultation",category:"services",desc:"Help choosing colours and combinations that suit your space, lighting and style.",initial:"CC"},
    {id:"home-improvement",name:"Home Improvement Request",category:"services",desc:"Tell us what needs attention and we will discuss the materials, labour and next steps.",initial:"HI"}
  ];

  const cartKey = "odw_cart_v1";
  let cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
  const search = document.querySelector("#shop-search");
  const category = document.querySelector("#shop-category");
  const cartDrawer = document.querySelector(".cart-drawer");

  function save(){ localStorage.setItem(cartKey, JSON.stringify(cart)); updateCart(); }
  function productById(id){ return products.find(p => p.id === id); }
  function count(){ return cart.reduce((n,i) => n + i.qty, 0); }

  function renderProducts(){
    const q = (search.value || "").trim().toLowerCase();
    const cat = category.value;
    const filtered = products.filter(p => (cat === "all" || p.category === cat) && (!q || (p.name + " " + p.desc).toLowerCase().includes(q)));
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
    productGrid.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.add)));
  }

  function addToCart(id){
    const item = cart.find(i => i.id === id);
    if(item) item.qty += 1; else cart.push({id,qty:1});
    save(); openCart();
  }
  function changeQty(id,delta){
    const item = cart.find(i => i.id === id); if(!item) return;
    item.qty += delta;
    if(item.qty <= 0) cart = cart.filter(i => i.id !== id);
    save();
  }
  function updateCart(){
    document.querySelectorAll(".cart-count").forEach(el => el.textContent = count());
    document.querySelector("#cart-total-items").textContent = count();
    const box = document.querySelector("#cart-items");
    const empty = document.querySelector("#cart-empty");
    if(!cart.length){ box.innerHTML = ""; empty.hidden = false; return; }
    empty.hidden = true;
    box.innerHTML = cart.map(i => { const p = productById(i.id); return `
      <div class="cart-row">
        <div><h3>${p.name}</h3><p>Price to be confirmed with OdiwommaHome</p><div class="cart-controls"><button class="qty-btn" data-minus="${p.id}">−</button><strong>${i.qty}</strong><button class="qty-btn" data-plus="${p.id}">+</button><button class="remove-item" data-remove="${p.id}">Remove</button></div></div>
        <strong>Quote</strong>
      </div>`; }).join("");
    box.querySelectorAll("[data-minus]").forEach(b => b.onclick = () => changeQty(b.dataset.minus,-1));
    box.querySelectorAll("[data-plus]").forEach(b => b.onclick = () => changeQty(b.dataset.plus,1));
    box.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => { cart = cart.filter(i => i.id !== b.dataset.remove); save(); });
  }
  function openCart(){ document.body.classList.add("cart-open"); cartDrawer.setAttribute("aria-hidden","false"); }
  function closeCart(){ document.body.classList.remove("cart-open"); cartDrawer.setAttribute("aria-hidden","true"); }

  document.querySelectorAll("[data-open-cart]").forEach(b => b.addEventListener("click", openCart));
  document.querySelectorAll("[data-close-cart]").forEach(b => b.addEventListener("click", closeCart));
  document.querySelector("#clear-cart").addEventListener("click", () => { cart=[]; save(); });
  document.querySelector("#whatsapp-order").addEventListener("click", () => {
    if(!cart.length){ alert("Your cart is empty. Add an item first."); return; }
    const lines = cart.map(i => { const p = productById(i.id); return `• ${p.name} x${i.qty}`; });
    const msg = `Hello OdiwommaHome, I would like to place an order / request a quote.%0A%0A${lines.join("%0A")}%0A%0APlease confirm availability, pricing, delivery and payment details. Thank you.`;
    window.open(`https://wa.me/2349046193188?text=${msg}`, "_blank");
  });
  search.addEventListener("input", renderProducts);
  category.addEventListener("change", renderProducts);
  renderProducts();
  updateCart();
});
