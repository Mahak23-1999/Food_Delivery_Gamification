/* =========================================
   BiteRush — Gamified Food Delivery App
   script.js
   ========================================= */

// ====================================================
// DATA: MENU ITEMS
// ====================================================
const menuItems = [
  { id: 1,  img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", name: "Classic Smash Burger",   price: 199, desc: "Double patty, cheddar, pickles, special sauce",    category: "burger",  rating: "4.7 ⭐", badge: "popular", badgeClass: "popular" },
  { id: 2,  img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80", name: "Margherita Pizza",       price: 299, desc: "Fresh mozzarella, basil, San Marzano tomatoes",    category: "pizza",   rating: "4.8 ⭐", badge: "veg",     badgeClass: "veg" },
  { id: 3,  img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80", name: "Spicy Ramen Bowl",       price: 249, desc: "Rich tonkotsu broth, soft boiled egg, chashu",     category: "chinese", rating: "4.6 ⭐", badge: "popular", badgeClass: "popular" },
  { id: 4,  img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80", name: "Street Tacos Trio",      price: 179, desc: "Chicken, salsa, jalapeño, lime crema",             category: "popular", rating: "4.5 ⭐", badge: "spicy 🌶", badgeClass: "" },
  { id: 5,  img: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80", name: "Bento Box Deluxe",       price: 349, desc: "Sushi rolls, tempura, miso soup, edamame",         category: "popular", rating: "4.9 ⭐", badge: "premium", badgeClass: "popular" },
  { id: 6,  img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80", name: "NY Cheesecake Slice",    price: 149, desc: "Creamy New York style, berry compote on top",      category: "dessert", rating: "4.8 ⭐", badge: "veg",     badgeClass: "veg" },
  { id: 7,  img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80", name: "Crispy Fried Chicken",   price: 229, desc: "Nashville hot, coleslaw, pickled chilli",          category: "popular", rating: "4.7 ⭐", badge: "popular", badgeClass: "popular" },
  { id: 8,  img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80", name: "Garden Harvest Bowl",    price: 189, desc: "Quinoa, avocado, roasted veggies, tahini dressing", category: "popular", rating: "4.6 ⭐", badge: "veg",     badgeClass: "veg" },
  { id: 9,  img: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80", name: "Sashimi Platter",        price: 449, desc: "Salmon, tuna, yellowtail, pickled ginger",         category: "popular", rating: "4.9 ⭐", badge: "premium", badgeClass: "popular" },
  { id: 10, img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80", name: "Glazed Donut Box (6)",   price: 129, desc: "Mixed glazed donuts, maple & chocolate",           category: "dessert", rating: "4.5 ⭐", badge: "veg",     badgeClass: "veg" },
  { id: 11, img: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&q=80", name: "Gourmet Club Sandwich",  price: 219, desc: "Turkey, bacon, avocado, sun-dried tomato aioli",   category: "popular", rating: "4.6 ⭐", badge: "", badgeClass: "" },
  { id: 12, img: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80", name: "Kung Pao Noodles",       price: 239, desc: "Wok-tossed noodles, peanuts, Sichuan peppers",     category: "chinese", rating: "4.7 ⭐", badge: "spicy 🌶", badgeClass: "" },
];

// ====================================================
// STATE
// ====================================================
let cart = {};             // { itemId: quantity }
let totalPoints = 0;
let activeGame = 'catch';
let deliveryCompleted = false;
let orderInProgress = false;

// Tracker interval IDs
let trackerInterval = null;
let currentStep = 0;

// ====================================================
// UTILITY: TOAST
// ====================================================
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ====================================================
// UTILITY: ADD POINTS
// ====================================================
function addPoints(pts) {
  totalPoints += pts;
  updatePointsUI();
}

function updatePointsUI() {
  document.getElementById('totalPoints').textContent = totalPoints;

  // Progress bar: milestone is 200pts max display
  const pct = Math.min((totalPoints / 200) * 100, 100);
  document.getElementById('ptsProgress').style.width = pct + '%';

  // Goal label
  const goalLabel = document.getElementById('ptsGoalLabel');
  if (totalPoints < 50) {
    goalLabel.textContent = `${50 - totalPoints} pts to ₹20 OFF`;
  } else if (totalPoints < 100) {
    goalLabel.textContent = `${100 - totalPoints} pts to Free Delivery`;
  } else if (totalPoints < 200) {
    goalLabel.textContent = `${200 - totalPoints} pts to ₹50 OFF`;
  } else {
    goalLabel.textContent = `Max rewards unlocked! 🎉`;
  }

  // Unlock badges
  checkRewards();
}

let unlockedRewards = new Set();

function checkRewards() {
  const milestones = [
    { pts: 50,  id: 'reward-50',  coupon: 'You unlocked ₹20 OFF! Use code <strong>BITE20</strong>' },
    { pts: 100, id: 'reward-100', coupon: 'Free Delivery unlocked! Use code <strong>FREESHIP</strong>' },
    { pts: 200, id: 'reward-200', coupon: '₹50 OFF unlocked! Use code <strong>BITE50</strong>' },
  ];
  milestones.forEach(m => {
    if (totalPoints >= m.pts && !unlockedRewards.has(m.id)) {
      unlockedRewards.add(m.id);
      document.getElementById(m.id).classList.add('unlocked');
      const banner = document.getElementById('couponBanner');
      banner.style.display = 'flex';
      document.getElementById('couponText').innerHTML = m.coupon;
      showToast(`🎉 Reward unlocked! ${m.coupon.replace(/<[^>]+>/g, '')}`);
    }
  });
}

// ====================================================
// RENDER FOOD GRID
// ====================================================
function renderFoodGrid(filter = 'all') {
  const grid = document.getElementById('foodGrid');
  grid.innerHTML = '';

  const items = filter === 'all'
    ? menuItems
    : menuItems.filter(i => i.category === filter || (filter === 'popular' && i.badge === 'popular'));

  items.forEach((item, idx) => {
    const qty = cart[item.id] || 0;
    const card = document.createElement('div');
    card.className = 'food-card';
    card.style.animationDelay = `${idx * 0.06}s`;
    card.innerHTML = `
      <div class="food-img-wrap">
        <img src="${item.img}" alt="${item.name}" loading="lazy" />
        ${item.badge ? `<span class="food-badge ${item.badgeClass}">${item.badge}</span>` : ''}
      </div>
      <div class="food-info">
        <div class="food-name">${item.name}</div>
        <div class="food-desc">${item.desc}</div>
        <div class="food-meta">
          <span class="food-price">₹${item.price}</span>
          <span class="food-rating">${item.rating}</span>
        </div>
        ${qty === 0
          ? `<button class="add-btn" onclick="addToCart(${item.id})">+ Add to Cart</button>`
          : `<div class="qty-control">
               <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
               <span class="qty-num">${qty}</span>
               <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
             </div>`
        }
      </div>
    `;
    grid.appendChild(card);
  });
}

// ====================================================
// CART LOGIC
// ====================================================
function addToCart(id) {
  if (orderInProgress) { showToast('⚠ Complete your current order first!'); return; }
  cart[id] = (cart[id] || 0) + 1;
  renderFoodGrid(currentFilter);
  renderCart();
  bumpCartCount();
  showToast(`✅ ${menuItems.find(i => i.id === id).name} added to cart!`);
}

function changeQty(id, delta) {
  if (orderInProgress) return;
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  renderFoodGrid(currentFilter);
  renderCart();
  bumpCartCount();
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartCount = document.getElementById('cartCount');

  const ids = Object.keys(cart).map(Number);

  if (ids.length === 0) {
    cartItems.innerHTML = `<p class="cart-empty">Your cart is empty.<br/>Add something delicious!</p>`;
    cartFooter.style.display = 'none';
    cartCount.textContent = '0';
    return;
  }

  let html = '';
  let subtotal = 0;
  let totalQty = 0;

  ids.forEach(id => {
    const item = menuItems.find(i => i.id === id);
    const qty = cart[id];
    const lineTotal = item.price * qty;
    subtotal += lineTotal;
    totalQty += qty;

    html += `
      <div class="cart-item">
        <img class="cart-item-thumb" src="${item.img}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${lineTotal}</div>
        </div>
        <div class="cart-item-qty">
          <button class="ci-qty-btn" onclick="changeQty(${id}, -1)">−</button>
          <span class="ci-qty-num">${qty}</span>
          <button class="ci-qty-btn" onclick="changeQty(${id}, +1)">+</button>
        </div>
      </div>
    `;
  });

  cartItems.innerHTML = html;
  cartFooter.style.display = 'block';
  cartCount.textContent = totalQty;

  document.getElementById('cartSubtotal').textContent = `₹${subtotal}`;
  document.getElementById('cartTotal').textContent = `₹${subtotal + 30}`;
}

function bumpCartCount() {
  const el = document.getElementById('cartCount');
  el.classList.remove('bump');
  void el.offsetWidth; // reflow trick
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 300);
}

// Cart open/close
document.getElementById('cartToggleBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('visible');
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('visible');
}

// ====================================================
// FILTER TABS
// ====================================================
let currentFilter = 'all';

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderFoodGrid(currentFilter);
  });
});

// ====================================================
// PLACE ORDER → TRACKER
// ====================================================
document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);

function placeOrder() {
  if (Object.keys(cart).length === 0) {
    showToast('🛒 Your cart is empty!');
    return;
  }

  orderInProgress = true;
  closeCart();

  // Hide menu, show tracker
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('menuSection').style.display = 'none';
  document.getElementById('foodGrid').closest('.food-grid-wrapper').style.display = 'none';
  document.getElementById('trackerSection').style.display = 'flex';

  // Generate order ID
  const orderId = '#BR' + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('trackerOrderId').textContent = `Order ${orderId} · Estimated 30–35 min`;

  // Reset timeline
  currentStep = 0;
  document.querySelectorAll('.tl-step').forEach(s => {
    s.classList.remove('completed', 'active');
  });

  // Start with step 0 completed
  document.getElementById('step-0').classList.add('completed');
  advanceTracker(); // begin progression
}

function advanceTracker() {
  // Step timings (ms): step1=4s, step2=6s, step3=5s, step4=5s
  const delays = [4000, 6000, 5000, 5000];

  function doStep(n) {
    setTimeout(() => {
      // Mark prev as completed, current as active
      document.getElementById(`step-${n - 1}`).classList.remove('active');
      document.getElementById(`step-${n - 1}`).classList.add('completed');
      document.getElementById(`step-${n}`).classList.add('active');

      if (n === 4) {
        // DELIVERED
        setTimeout(completeDelivery, 1000);
      } else if (n < 4) {
        doStep(n + 1);
      }
    }, delays[n - 1]);
  }

  doStep(1);
}

function completeDelivery() {
  deliveryCompleted = true;
  orderInProgress = false;

  // Final step: active → completed
  document.querySelectorAll('.tl-step').forEach(s => {
    s.classList.remove('active');
    s.classList.add('completed');
  });

  // Show success
  document.getElementById('deliverySuccess').style.display = 'block';

  // Disable games
  document.getElementById('gamePanel').classList.add('disabled');

  showToast('🎉 Order delivered! Enjoy your meal!', 4000);

  // Stop any running games
  stopAllGames();
}

// Re-order
document.getElementById('reorderBtn').addEventListener('click', () => {
  cart = {};
  totalPoints = 0;
  unlockedRewards.clear();
  deliveryCompleted = false;
  orderInProgress = false;

  // Reset UI
  document.getElementById('heroSection').style.display = '';
  document.getElementById('menuSection').style.display = '';
  document.getElementById('foodGrid').closest('.food-grid-wrapper').style.display = '';
  document.getElementById('trackerSection').style.display = 'none';
  document.getElementById('deliverySuccess').style.display = 'none';
  document.getElementById('gamePanel').classList.remove('disabled');

  // Reset badges
  document.querySelectorAll('.reward-badge').forEach(b => b.classList.remove('unlocked'));
  document.getElementById('couponBanner').style.display = 'none';
  updatePointsUI();
  renderFoodGrid(currentFilter);
  renderCart();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Welcome back! Order again 🍔');
});

// ====================================================
// GAME SWITCHER
// ====================================================
function switchGame(name) {
  activeGame = name;
  document.querySelectorAll('.game-container').forEach(g => g.style.display = 'none');
  document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`game-${name}`).style.display = 'block';
  document.querySelector(`[data-game="${name}"]`).classList.add('active');
  stopAllGames();
}

function stopAllGames() {
  stopCatch();
  stopTap();
  stopMemory();
}

// ====================================================
// GAME 1: INGREDIENT CATCH
// ====================================================
let catchInterval  = null;
let catchCountdown = null;
let catchActive    = false;
let catchTimeLeft  = 30;
let catchScoreVal  = 0;

const ingredients = ['🥦', '🥕', '🧅', '🍅', '🫑', '🌽', '🧄', '🥬', '🫒', '🍋'];

function startCatch() {
  stopCatch();
  catchActive   = true;
  catchTimeLeft = 30;
  catchScoreVal = 0;

  document.getElementById('catchScore').textContent = '0';
  document.getElementById('catchTimer').textContent = '30s';
  document.getElementById('catchStartMsg').style.display = 'none';

  const arena = document.getElementById('catchArena');
  // Clear old items
  arena.querySelectorAll('.falling-item').forEach(e => e.remove());

  // Countdown
  catchCountdown = setInterval(() => {
    catchTimeLeft--;
    document.getElementById('catchTimer').textContent = catchTimeLeft + 's';
    if (catchTimeLeft <= 0) {
      endCatch();
    }
  }, 1000);

  // Spawn items
  catchInterval = setInterval(spawnIngredient, 700);
}

function spawnIngredient() {
  if (!catchActive) return;
  const arena = document.getElementById('catchArena');
  const el = document.createElement('div');
  el.className = 'falling-item';
  el.textContent = ingredients[Math.floor(Math.random() * ingredients.length)];

  const arenaW = arena.offsetWidth - 50;
  el.style.left = Math.random() * arenaW + 'px';
  const speed = 2.5 + Math.random() * 2;
  el.style.animationDuration = speed + 's';

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!catchActive) return;

    // Score
    catchScoreVal += 5;
    document.getElementById('catchScore').textContent = catchScoreVal;
    addPoints(5);

    // Pop label
    const pop = document.createElement('div');
    pop.className = 'catch-score-pop';
    pop.textContent = '+5';
    pop.style.left = el.style.left;
    pop.style.top = el.offsetTop + 'px';
    arena.appendChild(pop);
    setTimeout(() => pop.remove(), 800);

    el.remove();
  });

  arena.appendChild(el);

  // Remove if missed
  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, speed * 1000 + 200);
}

function stopCatch() {
  catchActive = false;
  clearInterval(catchInterval);
  clearInterval(catchCountdown);
  catchInterval  = null;
  catchCountdown = null;
}

function endCatch() {
  stopCatch();
  const arena = document.getElementById('catchArena');
  arena.querySelectorAll('.falling-item').forEach(e => e.remove());
  showToast(`🥦 Game over! You scored ${catchScoreVal} pts! (+${catchScoreVal} points added)`, 3200);
  document.getElementById('catchTimer').textContent = '0s';
}

// ====================================================
// GAME 2: QUICK TAP CHALLENGE
// ====================================================
let tapCountVal  = 0;
let tapTimeLeft  = 10;
let tapActive    = false;
let tapCountdown = null;

function startTap() {
  stopTap();
  tapActive   = true;
  tapCountVal = 0;
  tapTimeLeft = 10;

  document.getElementById('tapCount').textContent = '0';
  document.getElementById('tapTimer').textContent = '10s';
  document.getElementById('tapStartMsg').style.display = 'none';
  document.getElementById('tapResult').style.display   = 'none';
  document.getElementById('tapButton').style.display   = 'flex';

  tapCountdown = setInterval(() => {
    tapTimeLeft--;
    document.getElementById('tapTimer').textContent = tapTimeLeft + 's';
    if (tapTimeLeft <= 0) {
      endTap();
    }
  }, 1000);
}

function registerTap() {
  if (!tapActive) return;
  tapCountVal++;
  document.getElementById('tapCount').textContent = tapCountVal;

  // Visual ripple on button
  const btn = document.getElementById('tapButton');
  btn.style.transform = 'scale(0.9)';
  setTimeout(() => btn.style.transform = '', 80);
}

function stopTap() {
  tapActive = false;
  clearInterval(tapCountdown);
  tapCountdown = null;
}

function endTap() {
  stopTap();
  document.getElementById('tapButton').style.display = 'none';

  const pts = Math.floor(tapCountVal * 0.5);
  addPoints(pts);

  let rank = tapCountVal >= 80 ? '🏆 Legendary!' : tapCountVal >= 50 ? '🥇 Pro Tapper!' : tapCountVal >= 25 ? '🥈 Good Job!' : '🥉 Keep Practicing!';
  document.getElementById('tapResultText').textContent = `${tapCountVal} taps! ${rank} +${pts} pts`;
  document.getElementById('tapResult').style.display = 'flex';

  showToast(`👆 ${tapCountVal} taps! +${pts} points earned!`, 3000);
}

// ====================================================
// GAME 3: MEMORY MATCH
// ====================================================
const foodEmojis = ['🍕', '🍔', '🍜', '🍣', '🍩', '🌮', '🍗', '🥗'];
let memoryCards     = [];
let flippedCards    = [];
let matchedCount    = 0;
let memoryActive    = false;
let memoryTimeLeft  = 60;
let memoryCountdown = null;
let memoryLocked    = false; // prevent triple-flip

function startMemory() {
  stopMemory();
  matchedCount    = 0;
  flippedCards    = [];
  memoryActive    = true;
  memoryLocked    = false;
  memoryTimeLeft  = 60;

  document.getElementById('memoryMatches').textContent = '0';
  document.getElementById('memoryTimer').textContent   = '60s';
  document.getElementById('memoryStartMsg').style.display = 'none';

  const grid = document.getElementById('memoryGrid');
  grid.style.display = 'grid';
  grid.innerHTML = '';

  // Shuffle pairs
  const pairs = [...foodEmojis, ...foodEmojis];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  memoryCards = pairs;

  pairs.forEach((emoji, idx) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = idx;
    card.dataset.emoji = emoji;
    card.innerHTML = `
      <div class="card-front">❓</div>
      <div class="card-back">${emoji}</div>
    `;
    card.addEventListener('click', () => flipMemoryCard(card));
    grid.appendChild(card);
  });

  // Timer
  memoryCountdown = setInterval(() => {
    memoryTimeLeft--;
    document.getElementById('memoryTimer').textContent = memoryTimeLeft + 's';
    if (memoryTimeLeft <= 0) endMemory(false);
  }, 1000);
}

function flipMemoryCard(card) {
  if (!memoryActive) return;
  if (memoryLocked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    memoryLocked = true;
    const [a, b] = flippedCards;

    if (a.dataset.emoji === b.dataset.emoji) {
      // Match!
      setTimeout(() => {
        a.classList.add('matched');
        b.classList.add('matched');
        matchedCount++;
        document.getElementById('memoryMatches').textContent = matchedCount;
        flippedCards = [];
        memoryLocked = false;
        addPoints(10);

        if (matchedCount === 8) endMemory(true);
      }, 400);
    } else {
      // No match: flip back
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flippedCards = [];
        memoryLocked = false;
      }, 900);
    }
  }
}

function stopMemory() {
  memoryActive = false;
  clearInterval(memoryCountdown);
  memoryCountdown = null;
}

function endMemory(won) {
  stopMemory();
  const pts = matchedCount * 10;
  if (won) {
    showToast(`🧠 All matched! +${pts} points! You're a memory master! 🏆`, 3500);
  } else {
    showToast(`⏰ Time's up! ${matchedCount}/8 matches. +${pts} pts. Try again!`, 3000);
  }
}

// ====================================================
// INIT
// ====================================================
renderFoodGrid('all');
renderCart();
