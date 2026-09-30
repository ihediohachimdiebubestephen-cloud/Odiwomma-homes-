document.addEventListener("DOMContentLoaded", function(){
  const menu=document.querySelector(".menu"), links=document.querySelector(".nav-links");
  if(menu&&links){menu.addEventListener("click",()=>{links.classList.toggle("open");menu.setAttribute("aria-expanded",links.classList.contains("open"));});links.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")));}
  const productGrid=document.querySelector("#product-grid"); if(!productGrid) return;
  const products=Array.isArray(window.ODIWOMMA_PRODUCTS)?window.ODIWOMMA_PRODUCTS:[];
  const cartKey="odw_cart_v1"; let cart=[]; try{cart=JSON.parse(localStorage.getItem(cartKey)||"[]");}catch(e){cart=[];}
  const search=document.querySelector("#shop-search"), category=document.querySelector("#shop-category"), cartDrawer=document.querySelector(".cart-drawer"), checkoutModal=document.querySelector("#checkout-modal"), checkoutBackdrop=document.querySelector("#checkout-backdrop"), checkoutForm=document.querySelector("#checkout-form"), checkoutSummary=document.querySelector("#checkout-summary"), checkoutWrap=document.querySelector("#checkout-form-wrap"), orderSuccess=document.querySelector("#order-success");
  function save(){localStorage.setItem(cartKey,JSON.stringify(cart));updateCart();}
  function productById(id){return products.find(p=>p.id===id)} function count(){return cart.reduce((n,i)=>n+i.qty,0)}
  function renderProducts(){const q=(search.value||"").trim().toLowerCase(),cat=category.value;const filtered=products.filter(p=>(cat==="all"||p.category===cat)&&(!q||(p.name+" "+p.desc).toLowerCase().includes(q)));productGrid.innerHTML=filtered.map(p=>`<article class="product-card"><div class="product-visual"><span class="product-tag">${p.category}</span><span class="product-initial">${p.initial}</span></div><div class="product-body"><h3>${p.name}</h3><p>${p.desc}</p><div class="product-meta"><span class="quote-price">₦${p.price.toLocaleString("en-NG")}</span></div><button class="btn product-add" type="button" data-add="${p.id}">Add to cart</button></div></article>`).join("");document.querySelector("#empty-products").hidden=filtered.length!==0;productGrid.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>addToCart(b.dataset.add)));}
  function addToCart(id){const item=cart.find(i=>i.id===id);if(item)item.qty+=1;else cart.push({id,qty:1});save();openCart();}
  function changeQty(id,delta){const item=cart.find(i=>i.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);save();}
  function money(value){return `₦${Number(value||0).toLocaleString("en-NG")}`;}
  function cartTotal(){return cart.reduce((sum,i)=>{const p=productById(i.id);return sum+(p?p.price*i.qty:0)},0);}
  function updateCart(){
    document.querySelectorAll(".cart-count").forEach(el=>el.textContent=count());
    document.querySelector("#cart-total-items").textContent=count();
    document.querySelector("#cart-total").textContent=money(cartTotal());
    const box=document.querySelector("#cart-items"),empty=document.querySelector("#cart-empty");
    if(!cart.length){box.innerHTML="";empty.hidden=false;return;}
    empty.hidden=true;
    box.innerHTML=cart.map(i=>{const p=productById(i.id),line=p.price*i.qty;return `<div class="cart-row"><div><h3>${p.name}</h3><p>${money(p.price)} each</p><div class="cart-controls"><button class="qty-btn" data-minus="${p.id}" type="button">−</button><strong>${i.qty}</strong><button class="qty-btn" data-plus="${p.id}" type="button">+</button><button class="remove-item" data-remove="${p.id}" type="button">Remove</button></div></div><strong>${money(line)}</strong></div>`}).join("");
    box.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));
    box.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));
    box.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{cart=cart.filter(i=>i.id!==b.dataset.remove);save();});
  }
  function openCart(){document.body.classList.add("cart-open");cartDrawer.setAttribute("aria-hidden","false")} function closeCart(){document.body.classList.remove("cart-open");cartDrawer.setAttribute("aria-hidden","true")}
  async function getAuth(){try{if(!window.supabase||!window.ODIWOMMA_SUPABASE_URL||!window.ODIWOMMA_SUPABASE_KEY)return null;return window.supabase.createClient(window.ODIWOMMA_SUPABASE_URL,window.ODIWOMMA_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}})}catch(e){return null}}
  async function setupAccountLink(){const link=document.querySelector("#account-link");if(!link)return;const sb=await getAuth();if(!sb)return;const {data:{session}}=await sb.auth.getSession();if(session){link.textContent="My Account";link.href="account.html";link.title=session.user.email||"My account";}}
  async function openCheckout(){
    if(!cart.length){alert("Your cart is empty. Add an item first.");return;}
    const sb=await getAuth();
    if(!sb){alert("Please log in or create a customer account before checkout.");return;}
    const {data:{session}}=await sb.auth.getSession();
    if(!session){location.href="login.html?next=shop.html";return;}
    const {data:profile}=await sb.from("profiles").select("full_name,phone,delivery_address").eq("id",session.user.id).maybeSingle();
    checkoutSummary.innerHTML=`<div class="checkout-summary-title">Your selected items</div>${cart.map(i=>{const p=productById(i.id);return `<div class="checkout-summary-item"><span>${p.name} × ${i.qty}</span><strong>${money(p.price*i.qty)}</strong></div>`}).join("")}<div class="checkout-summary-item" style="border-top:1px solid #ddd;margin-top:8px;padding-top:12px"><strong>Total</strong><strong>${money(cartTotal())}</strong></div>`;
    checkoutWrap.hidden=false;orderSuccess.hidden=true;checkoutModal.setAttribute("aria-hidden","false");document.body.classList.add("checkout-open");closeCart();
    document.querySelector("#customer-name").value=profile?.full_name||session.user.user_metadata?.full_name||"";
    document.querySelector("#customer-phone").value=profile?.phone||session.user.user_metadata?.phone||"";
    document.querySelector("#customer-address").value=profile?.delivery_address||"";
    document.querySelector("#customer-note").value="";
    document.querySelector("#customer-name").focus();
  }
  function closeCheckout(){document.body.classList.remove("checkout-open");checkoutModal.setAttribute("aria-hidden","true")}
  document.querySelectorAll("[data-open-cart]").forEach(b=>b.addEventListener("click",openCart));document.querySelectorAll("[data-close-cart]").forEach(b=>b.addEventListener("click",closeCart));
  document.querySelector("#clear-cart").addEventListener("click",()=>{cart=[];save()});document.querySelector("#checkout-order").addEventListener("click",openCheckout);document.querySelector("#checkout-close").addEventListener("click",closeCheckout);checkoutBackdrop.addEventListener("click",closeCheckout);document.querySelector("#success-close").addEventListener("click",closeCheckout);
  checkoutForm.addEventListener("submit",async function(e){
    e.preventDefault();
    if(!cart.length){alert("Your cart is empty. Add an item first.");closeCheckout();return;}
    const sb=await getAuth();
    if(!sb){alert("Please log in before placing an order.");return;}
    const {data:{session}}=await sb.auth.getSession();
    if(!session){location.href="login.html?next=shop.html";return;}
    const name=document.querySelector("#customer-name").value.trim(),phone=document.querySelector("#customer-phone").value.trim(),address=document.querySelector("#customer-address").value.trim(),note=document.querySelector("#customer-note").value.trim();
    if(!name||!phone||!address){alert("Please complete your name, phone number and delivery address.");return;}
    const orderRef=`ODW-${Date.now().toString().slice(-8)}`;
    const payload={order_ref:orderRef,customer_id:session.user.id,customer_name:name,customer_phone:phone,delivery_address:address,order_note:note||null,items:cart.map(i=>{const p=productById(i.id);return{id:p.id,name:p.name,qty:i.qty,unit_price:p.price,line_total:p.price*i.qty}}),total:cartTotal(),status:"new",payment_status:"unpaid"};
    const {error}=await sb.from("orders").insert(payload);
    if(error){console.error("Order save failed:",error);alert("We could not place the order yet. Please try again.\n\n"+error.message);return;}
    cart=[];save();checkoutWrap.hidden=true;orderSuccess.hidden=false;document.querySelector("#success-message").textContent=`Your order ${orderRef} has been saved to your account. You can view its status from My Account.`;
  });
  search.addEventListener("input",renderProducts);category.addEventListener("change",renderProducts);renderProducts();updateCart();setupAccountLink();
});