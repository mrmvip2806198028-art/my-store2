const cfg = SITE_CONFIG;
let products = JSON.parse(localStorage.getItem("bm_products") || "null") || DEFAULT_PRODUCTS;
let cart = JSON.parse(localStorage.getItem("bm_cart") || "[]");

const $ = s => document.querySelector(s);
const money = n => `${cfg.currency} ${Number(n).toFixed(2)}`;

function save(){ localStorage.setItem("bm_products", JSON.stringify(products)); localStorage.setItem("bm_cart", JSON.stringify(cart)); }
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }

function renderProducts(list=products){
  const grid=$("#productsGrid");
  if(!grid) return;
  if(!list.length){grid.innerHTML='<p>لا توجد منتجات.</p>';return}
  grid.innerHTML=list.map(p=>`
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image || "assets/logo.jpg"}" alt="${escapeHtml(p.name)}" onerror="this.src='assets/logo.jpg'">
        ${p.badge?`<span class="product-badge">${escapeHtml(p.badge)}</span>`:""}
      </div>
      <h3>${escapeHtml(p.name)}</h3>
      <div class="desc">${escapeHtml(p.description||"")}</div>
      <div class="product-bottom">
        <span class="price">${money(p.price)}</span>
        <button class="add-btn" onclick="addToCart(${p.id})">أضف للسلة</button>
      </div>
    </article>`).join("");
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

window.addToCart = function(id){
 const p=products.find(x=>x.id===id); if(!p)return;
 const old=cart.find(x=>x.id===id);
 if(old) old.qty++; else cart.push({id,qty:1});
 save(); renderCart(); openCart(); toast("تمت إضافة المنتج للسلة");
}
function renderCart(){
 const box=$("#cartItems");
 const count=cart.reduce((a,b)=>a+b.qty,0); $("#cartCount").textContent=count;
 if(!cart.length){box.innerHTML='<p style="text-align:center;color:#aeb5bd;padding:40px 0">السلة فارغة</p>'}
 else box.innerHTML=cart.map(i=>{
  const p=products.find(x=>x.id===i.id); if(!p)return "";
  return `<div class="cart-row">
    <img src="${p.image||"assets/logo.jpg"}" alt="">
    <div><b>${escapeHtml(p.name)}</b><div>${money(p.price)}</div><div class="qty">
      <button onclick="changeQty(${p.id},-1)">−</button><span>${i.qty}</span><button onclick="changeQty(${p.id},1)">+</button>
    </div></div>
    <button class="remove" onclick="removeItem(${p.id})">حذف</button>
  </div>`}).join("");
 const sub=cart.reduce((s,i)=>{const p=products.find(x=>x.id===i.id);return s+(p?p.price*i.qty:0)},0);
 $("#subtotal").textContent=money(sub); $("#delivery").textContent=money(cfg.deliveryCost);
 $("#total").textContent=money(sub+Number(cfg.deliveryCost||0));
}
window.changeQty=(id,d)=>{const i=cart.find(x=>x.id===id);if(!i)return;i.qty+=d;if(i.qty<=0)cart=cart.filter(x=>x.id!==id);save();renderCart()}
window.removeItem=id=>{cart=cart.filter(x=>x.id!==id);save();renderCart()}

function openCart(){$("#cartDrawer").classList.add("open")}
function closeCart(){$("#cartDrawer").classList.remove("open")}
$("#cartBtn").onclick=openCart; $("#closeCart").onclick=closeCart;

$("#menuBtn").onclick=()=>{$("#sideMenu").classList.add("open");$("#overlay").classList.add("open")}
$("#closeMenu").onclick=()=>{$("#sideMenu").classList.remove("open");$("#overlay").classList.remove("open")}
$("#overlay").onclick=()=>{$("#sideMenu").classList.remove("open");$("#overlay").classList.remove("open")}

$("#themeBtn").onclick=()=>document.body.classList.toggle("light");
$("#searchBtn").onclick=()=>{$("#searchBox").classList.toggle("hidden");$("#searchInput").focus()}
$("#searchOpen").onclick=()=>{$("#searchBox").classList.toggle("hidden");$("#searchInput").focus()}
$("#searchInput").addEventListener("input",e=>{
 const q=e.target.value.trim().toLowerCase();
 renderProducts(products.filter(p=>(p.name+" "+(p.description||"")).toLowerCase().includes(q)));
});

$("#checkoutBtn").onclick=()=>{
 if(!cart.length){toast("السلة فارغة");return}
 $("#checkoutModal").classList.remove("hidden");
}
$("#closeCheckout").onclick=()=>$("#checkoutModal").classList.add("hidden");

$("#confirmOrder").onclick=()=>{
 const name=$("#customerName").value.trim(), phone=$("#customerPhone").value.trim(), city=$("#customerCity").value, address=$("#customerAddress").value.trim();
 if(!name||!phone||!city||!address){toast("من فضلك أكمل البيانات المطلوبة");return}
 const lines=cart.map(i=>{const p=products.find(x=>x.id===i.id);return `• ${p.name} × ${i.qty} = ${money(p.price*i.qty)}`}).join("\n");
 const sub=cart.reduce((s,i)=>{const p=products.find(x=>x.id===i.id);return s+(p?p.price*i.qty:0)},0);
 const total=sub+Number(cfg.deliveryCost||0);
 const msg=`طلب جديد من ${cfg.siteName}%0A%0Aالاسم: ${encodeURIComponent(name)}%0Aالهاتف: ${encodeURIComponent(phone)}%0Aالمدينة: ${encodeURIComponent(city)}%0Aالعنوان: ${encodeURIComponent(address)}%0Aالبريد: ${encodeURIComponent($("#customerEmail").value||"غير موجود")}%0Aملاحظات: ${encodeURIComponent($("#customerNotes").value||"لا يوجد")}%0A%0Aالمنتجات:%0A${encodeURIComponent(lines)}%0A%0Aالإجمالي: ${encodeURIComponent(money(total))}`;
 const wa=String(cfg.whatsapp).replace(/\D/g,"");
 window.open(`https://wa.me/${wa}?text=${msg}`,"_blank");
};

$("#contactBtn").href=`https://wa.me/${String(cfg.whatsapp).replace(/\D/g,"")}`;
$("#tiktokBtn").href=cfg.tiktokUrl;
$("#siteName").textContent=cfg.siteName;
$("#menuSiteName").textContent=cfg.siteName;
$("#subtitle").textContent=cfg.subtitle;
$("#country").textContent=cfg.country;
$("#location").textContent=cfg.locationText;
$("#footerText").textContent=cfg.footerText;

renderProducts(); renderCart();
