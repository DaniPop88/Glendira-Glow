(function () {
  'use strict';

  var CATALOG = {
    1: { name: "Everyday T-shirt", price: 199, stock: 10, img: "01-everyday-t-shirt" },
    2: { name: "Office Blazer (Women)", price: 799, stock: 7, img: "02-office-blazer-women" },
    3: { name: "Filipiniana Dress", price: 1099, stock: 5, img: "03-filipiniana-dress" },
    4: { name: "Men's Polo Shirt", price: 349, stock: 8, img: "04-mens-polo-shirt" },
    5: { name: "Teens Graphic Tee", price: 239, stock: 15, img: "05-teens-graphic-tee" },
    6: { name: "A-Line Skirt", price: 399, stock: 11, img: "06-a-line-skirt" },
    7: { name: "Kids Dress", price: 299, stock: 9, img: "07-kids-dress" },
    8: { name: "Seasonal Bomber Jacket", price: 899, stock: 6, img: "08-seasonal-bomber-jacket" },
    9: { name: "Men's Cotton Shorts", price: 269, stock: 13, img: "09-mens-cotton-shorts" },
    10: { name: "Women's Office Dress", price: 499, stock: 7, img: "10-womens-office-dress" },
    11: { name: "Classic Handbag", price: 599, stock: 12, img: "11-classic-handbag" },
    12: { name: "Minimalist Jewelry Set", price: 149, stock: 14, img: "12-minimalist-jewelry-set" },
    13: { name: "Kids Jogger Pants", price: 199, stock: 10, img: "13-kids-jogger-pants" },
    14: { name: "Women's Crop Top", price: 179, stock: 8, img: "14-womens-crop-top" },
    15: { name: "Premium Fabric Face Mask", price: 69, stock: 5, img: "15-premium-fabric-face-mask" }
  };
  var CART_KEY = 'checkoutCart';
  var ORDER_EMAIL = 'hello@glendiraglow.site';

  function $(id) { return document.getElementById(id); }
  function num(n) {
    var c = Math.round(n * 100);
    return c % 100 === 0 ? (c / 100).toLocaleString('en-PH') : (c / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function peso(n) { return '₱' + num(n); }
  function priceHTML(n) { return '<span class="cur">₱</span>' + num(n); }
  function icon(name) { return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>'; }

  function readCart() {
    try {
      var items = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(items)) return [];
      return items.filter(function (i) { return CATALOG[i.id] && i.qty > 0; }).map(function (i) {
        return { id: i.id, qty: Math.min(Math.floor(i.qty), CATALOG[i.id].stock) };
      });
    } catch (e) { return []; }
  }
  var cart = readCart();
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* works for this page view */ }
  }
  function line(id) { return cart.filter(function (i) { return i.id === id; })[0]; }
  function cartQty() { return cart.reduce(function (t, i) { return t + i.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (t, i) { return t + i.qty * CATALOG[i.id].price; }, 0); }

  function setQty(id, qty) {
    var item = line(id);
    qty = Math.min(qty, CATALOG[id].stock);
    if (qty <= 0) cart = cart.filter(function (i) { return i.id !== id; });
    else if (item) item.qty = qty;
    else cart.push({ id: id, qty: qty });
    saveCart();
    render();
  }

  /* Menu */
  var navList = $('nav-list');
  var navToggle = $('nav-toggle');
  function closeNav() {
    if (!navList || !navList.classList.contains('open')) return;
    navList.classList.remove('open');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus();
  }
  if (navList && navToggle) {
    navToggle.addEventListener('click', function () {
      navList.classList.add('open');
      document.body.style.overflow = 'hidden';
      navToggle.setAttribute('aria-expanded', 'true');
      $('nav-close').focus();
    });
    $('nav-close').addEventListener('click', closeNav);
    navList.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* Cart */
  var sidebar = $('cart-sidebar');
  var overlay = $('cart-overlay');
  var cartBtn = $('cart-btn');
  function openCart() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    sidebar.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    $('cart-close-btn').focus();
  }
  function closeCart() {
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    sidebar.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    cartBtn.focus();
  }
  function renderCart() {
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = cartQty(); });
    if (!sidebar) return;
    var box = $('cart-items');
    box.innerHTML = '';
    $('cart-foot').hidden = !cart.length;
    if (!cart.length) {
      box.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a class="btn" href="#shop" id="cart-empty-shop">See the products</a></div>';
      $('cart-empty-shop').addEventListener('click', closeCart);
      return;
    }
    cart.forEach(function (item) {
      var p = CATALOG[item.id];
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.dataset.id = item.id;
      row.innerHTML =
        '<img src="image/site/products/' + p.img + '-thumb.webp" alt="" width="72" height="72">' +
        '<div><h3>' + p.name + '</h3>' +
        '<div class="cart-item-row"><span class="qty">' +
        '<button type="button" data-a="dec" aria-label="Remove one ' + p.name + '">' + icon('minus') + '</button>' +
        '<output aria-label="Quantity">' + item.qty + '</output>' +
        '<button type="button" data-a="inc" aria-label="Add one more ' + p.name + '"' + (item.qty >= p.stock ? ' disabled' : '') + '>' + icon('plus') + '</button>' +
        '</span><span class="cart-item-sub">' + peso(p.price * item.qty) + '</span></div>' +
        '<button type="button" class="cart-remove" data-a="rm">Remove</button></div>';
      row.querySelector('[data-a=dec]').addEventListener('click', function () { setQty(item.id, item.qty - 1); focusLine(item.id, 'dec'); });
      row.querySelector('[data-a=inc]').addEventListener('click', function () { setQty(item.id, item.qty + 1); focusLine(item.id, 'inc'); });
      row.querySelector('[data-a=rm]').addEventListener('click', function () { setQty(item.id, 0); $('cart-close-btn').focus(); });
      box.appendChild(row);
    });
    $('cart-total').innerHTML = priceHTML(cartTotal());
  }
  function focusLine(id, action) {
    var row = document.querySelector('.cart-item[data-id="' + id + '"]');
    var btn = row && row.querySelector('[data-a=' + action + ']');
    if (btn && !btn.disabled) btn.focus(); else $('cart-close-btn').focus();
  }
  if (sidebar) {
    sidebar.setAttribute('aria-hidden', 'true');
    cartBtn.addEventListener('click', openCart);
    $('cart-close-btn').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    sidebar.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = sidebar.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    $('checkout-btn').addEventListener('click', function () {
      saveCart();
      window.location.href = 'order-summary.html';
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sidebar) closeCart();
    closeNav();
  });

  /* Products */
  function renderProducts() {
    document.querySelectorAll('.product-card').forEach(function (card) {
      var id = Number(card.dataset.id);
      var item = line(id);
      card.classList.toggle('in-cart', !!item);
      card.querySelector('.product-add').hidden = !!item;
      var stepper = card.querySelector('.stepper');
      stepper.hidden = !item;
      if (item) {
        stepper.querySelector('output').textContent = item.qty;
        stepper.querySelector('[data-a=inc]').disabled = item.qty >= CATALOG[id].stock;
      }
    });
  }
  function note(id) {
    if (cartBtn) { cartBtn.classList.remove('pop'); void cartBtn.offsetWidth; cartBtn.classList.add('pop'); }
    var live = $('cart-live');
    if (live) live.textContent = CATALOG[id].name + ' updated. ' + cartQty() + ' items in your cart.';
  }
  document.querySelectorAll('.product-card').forEach(function (card) {
    var id = Number(card.dataset.id);
    var add = card.querySelector('.product-add');
    var stepper = card.querySelector('.stepper');
    add.addEventListener('click', function () {
      setQty(id, 1); note(id);
      stepper.querySelector('[data-a=inc]').focus();
    });
    stepper.querySelector('[data-a=inc]').addEventListener('click', function () {
      setQty(id, line(id).qty + 1); note(id);
    });
    stepper.querySelector('[data-a=dec]').addEventListener('click', function () {
      setQty(id, line(id).qty - 1); note(id);
      if (line(id)) stepper.querySelector('[data-a=dec]').focus(); else add.focus();
    });
  });

  /* Order page */
  function renderOrder() {
    var body = $('summary-cart-body');
    if (!body || !$('order-sent').hidden) return;
    if (!cart.length) {
      $('order-layout').hidden = true;
      $('order-empty').hidden = false;
      return;
    }
    body.innerHTML = '';
    cart.forEach(function (item) {
      var p = CATALOG[item.id];
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + p.name + '<small>' + item.qty + ' × ' + peso(p.price) + '</small></td><td>' + peso(p.price * item.qty) + '</td>';
      body.appendChild(tr);
    });
    $('summary-cart-total').innerHTML = priceHTML(cartTotal());
  }
  var MESSAGES = {
    'customer-name': 'Please enter your full name.',
    'customer-contact': 'Enter a mobile number like 09171234567 or +639171234567.',
    'customer-address': 'Please enter your delivery address.',
    'customer-payment': 'Please choose how you would like to pay.'
  };
  function checkField(id) {
    var el = $(id);
    var ok = el.value.trim() !== '' && el.checkValidity();
    $(id + '-error').textContent = ok ? '' : MESSAGES[id];
    if (ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true');
    return ok;
  }
  function orderText() {
    var lines = ['New order from glendiraglow.site', ''];
    cart.forEach(function (i) {
      var p = CATALOG[i.id];
      lines.push(i.qty + ' x ' + p.name + ' - PHP ' + num(p.price * i.qty));
    });
    lines.push('', 'Total: PHP ' + num(cartTotal()), '');
    lines.push('Name: ' + $('customer-name').value.trim(), 'Mobile: ' + $('customer-contact').value.trim());
    var email = $('customer-email').value.trim();
    if (email) lines.push('Email: ' + email);
    lines.push('Address: ' + $('customer-address').value.trim(), 'Payment: ' + $('customer-payment').value);
    var notes = $('customer-notes').value.trim();
    if (notes) lines.push('Notes: ' + notes);
    return lines.join('\n');
  }
  var form = $('checkout-form');
  if (form) {
    form.noValidate = true;
    Object.keys(MESSAGES).forEach(function (id) {
      function recheck() { if ($(id).hasAttribute('aria-invalid')) checkField(id); }
      $(id).addEventListener('input', recheck);
      $(id).addEventListener('change', recheck);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(MESSAGES).forEach(function (id) {
        if (!checkField(id) && !firstBad) firstBad = $(id);
      });
      if (firstBad) { firstBad.focus(); return; }
      var text = orderText();
      var href = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent('New order: ' + $('customer-name').value.trim()) + '&body=' + encodeURIComponent(text);
      $('sent-email').href = href;
      $('sent-text').textContent = text;
      $('order-layout').hidden = true;
      $('order-intro').hidden = true;
      $('order-sent').hidden = false;
      $('order-sent-title').focus();
      window.scrollTo(0, 0);
      window.location.href = href;
    });
    $('sent-copy-btn').addEventListener('click', function () {
      var btn = this;
      var text = $('sent-text').textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { btn.textContent = 'Copied'; }, function () { btn.textContent = 'Select the text below to copy'; });
      } else { btn.textContent = 'Select the text below to copy'; }
    });
  }

  /* Eagle Glide: the logo's eagle flies a dotted path down the page as you scroll */
  var flight = $('flight'), svg = $('flight-svg'), trail = $('flight-path'), done = $('flight-done'), glider = $('glider');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (flight && svg && trail && glider) {
    var total = 0, docH = 0, ticking = false;
    var build = function () {
      docH = document.documentElement.scrollHeight; var w = document.documentElement.clientWidth;
      svg.setAttribute('width', w); svg.setAttribute('height', docH); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + docH);
      flight.style.height = docH + 'px';
      var secs = Array.prototype.slice.call(document.querySelectorAll('main > section, .spread'));
      var mx = w < 700 ? 22 : Math.max(36, (w - 1280) / 2 + 24), Mx = w - mx;
      var hero = document.querySelector('.cover'); var y0 = hero ? hero.offsetTop + hero.offsetHeight * .35 : 120;
      var pts = [[w < 700 ? Mx - 20 : w * .7, y0]];
      secs.forEach(function (s, i) { if (i) pts.push([i % 2 ? mx : Mx, s.offsetTop + Math.min(120, s.offsetHeight * .2)]); });
      pts.push([w / 2, docH - 120]);
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], my = (a[1] + b[1]) / 2;
        d += ' C' + a[0] + ' ' + my + ' ' + b[0] + ' ' + my + ' ' + b[0] + ' ' + b[1];
      }
      trail.setAttribute('d', d); done.setAttribute('d', d);
      total = trail.getTotalLength(); done.style.strokeDasharray = total; place();
    };
    var at = function (y) { var lo = 0, hi = total; for (var k = 0; k < 22; k++) { var mid = (lo + hi) / 2; if (trail.getPointAtLength(mid).y < y) lo = mid; else hi = mid; } return lo; };
    var place = function () {
      ticking = false; if (!total) return;
      var target = window.scrollY + window.innerHeight * .42;
      var len = still ? 0 : at(target), p = trail.getPointAtLength(len), q = trail.getPointAtLength(Math.min(total, len + 2));
      var ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI - 90;
      var flip = q.x < p.x - .05 ? ' scaleX(-1)' : '';
      glider.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) translate(-50%,-50%) rotate(' + Math.max(-30, Math.min(30, ang / 2)) + 'deg)' + flip;
      done.style.strokeDashoffset = total - len;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(place); } }, { passive: true });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
    window.addEventListener('load', build); build();
  }

  function render() {
    renderCart();
    renderProducts();
    renderOrder();
  }
  document.querySelectorAll('.footer-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  render();
})();
