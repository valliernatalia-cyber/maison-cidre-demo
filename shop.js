const cart = new Map();
const money = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const products = document.querySelectorAll(".shop-product");
const filters = document.querySelectorAll("[data-filter]");
const cartItems = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartCount = document.querySelector("[data-cart-count]");
const cartLabel = document.querySelector("[data-cart-label]");
const cartTotal = document.querySelector("[data-cart-total]");
const checkoutNote = document.querySelector("[data-checkout-note]");
const ageCheck = document.querySelector("[data-age]");
const shipping = document.querySelector("[data-shipping]");

document.documentElement.classList.add("js-enabled");
window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

const revealTargets = document.querySelectorAll(
  ".quick-info article, .split-copy, .photo-stack, .section-heading, .shop-toolbar, .shop-product, .cart-panel, .story > div, .story-grid img, .visit-band > div, .contact > *"
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

function renderCart() {
  const items = Array.from(cart.values());
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  cartCount.textContent = totalQty;
  cartLabel.textContent = totalQty > 1 ? "articles" : "article";
  cartTotal.textContent = money.format(total);
  cartEmpty.hidden = items.length > 0;

  cartItems.innerHTML = items
    .map(
      (item) => `
        <article class="cart-item">
          <div class="cart-item-title">
            <span>${item.name}</span>
            <span>${money.format(item.qty * item.price)}</span>
          </div>
          <small>${item.pack} - ${money.format(item.price)} / unité</small>
          <div class="qty-row">
            <span>Quantité</span>
            <div class="qty-controls" aria-label="Quantité ${item.name}">
              <button class="qty-button" type="button" data-dec="${item.id}" aria-label="Retirer ${item.name}">-</button>
              <strong>${item.qty}</strong>
              <button class="qty-button" type="button" data-inc="${item.id}" aria-label="Ajouter ${item.name}">+</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const item = {
      id: button.dataset.id,
      name: button.dataset.name,
      price: Number(button.dataset.price),
      pack: button.dataset.pack,
      qty: 0,
    };
    const existing = cart.get(item.id) || item;
    existing.qty += 1;
    cart.set(item.id, existing);
    checkoutNote.textContent = `${item.name} ajouté au panier.`;
    checkoutNote.classList.add("success");
    renderCart();
  });
});

cartItems.addEventListener("click", (event) => {
  const inc = event.target.closest("[data-inc]");
  const dec = event.target.closest("[data-dec]");
  const id = inc?.dataset.inc || dec?.dataset.dec;
  if (!id || !cart.has(id)) return;

  const item = cart.get(id);
  item.qty += inc ? 1 : -1;
  if (item.qty <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, item);
  }
  checkoutNote.classList.remove("success");
  checkoutNote.textContent = "Minimum de commande et frais de livraison confirmés par l'équipe.";
  renderCart();
});

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const category = button.dataset.filter;
    products.forEach((product) => {
      product.hidden = category !== "all" && product.dataset.category !== category;
    });
  });
});

document.querySelector("[data-checkout]").addEventListener("click", () => {
  const items = Array.from(cart.values());
  if (!items.length) {
    checkoutNote.textContent = "Ajoutez au moins un produit avant d'envoyer une demande.";
    checkoutNote.classList.remove("success");
    return;
  }

  const containsAlcohol = items.some((item) => item.id !== "jus-pomme");
  if (containsAlcohol && !ageCheck.checked) {
    checkoutNote.textContent = "La confirmation d'âge est nécessaire pour les produits alcoolisés.";
    checkoutNote.classList.remove("success");
    return;
  }

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const mode = shipping.value === "pickup" ? "retrait en boutique" : "livraison";
  checkoutNote.textContent = `Demande prête : ${items.length} référence(s), ${money.format(total)}, ${mode}.`;
  checkoutNote.classList.add("success");
});

renderCart();
