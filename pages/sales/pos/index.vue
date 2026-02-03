<template>
  <div class="pos-page">
    <!-- Main content area -->
    <section class="pos-content">
      <header class="pos-header">
        <div class="pos-search-wrap">
          <i class="fas fa-search pos-search-icon"></i>
          <input
            v-model="productSearchQuery"
            type="search"
            class="pos-search"
            placeholder="Search menu"
            aria-label="Search"
          />
        </div>
        <div class="pos-header-right">
          <span class="pos-user-greeting">Hai, {{ userDisplayName }}</span>
          <span class="pos-date">{{ formattedDate }}</span>
          <button type="button" class="pos-icon-btn" aria-label="Notifications">
            <i class="fas fa-bell"></i>
          </button>
          <div class="pos-avatar">
            <img
              v-if="userAvatarUrl"
              :src="userAvatarUrl"
              alt="Avatar"
              class="pos-avatar-img"
              @error="onAvatarImgError"
            />
            <span v-else class="pos-avatar-initial">{{ userInitials }}</span>
          </div>
        </div>
      </header>

      <div class="pos-main-inner">
        <div class="pos-categories-wrap">
          <h3 class="pos-categories-title">Categories</h3>
          <nav class="pos-category-nav">
            <button
              v-for="cat in posCategories"
              :key="cat.value"
              type="button"
              class="pos-category-btn"
              :class="{ active: activeCategory === cat.value }"
              @click="activeCategory = cat.value"
            >
              {{ cat.label }}
            </button>
          </nav>
        </div>

        <div class="article-row pos-content-aligned" style="width: 100%">
          <div class="pos-product-list-section">
            <h3 class="pos-categories-title">Product List</h3>
            <div class="pos-product-grid">
                <article
                    class="pos-product-card-wrap"
                    v-for="product in products"
                    :key="product.id"
                >
                    <div
                    class="pos-product-card"
                    :class="{ 'is-unavailable': getProductStock(product) === 0 }"
                    >
                    <!-- Header: image left, name + availability + price right -->
                    <div class="pos-product-card-header">
                        <div class="pos-product-card-thumb">
                            <img
                                :src="getProductImage(product.image) || '/img/branding/logo.png'"
                                alt="Product"
                                @error="(e) => (e.target.src = '/img/branding/logo.png')"
                            />
                        </div>
                        <div class="pos-product-card-info">
                            <h4 class="pos-product-card-name">{{ product.name }}</h4>
                            <p class="pos-product-card-availability">
                                {{ getProductStock(product) }} Available
                                <template v-if="product.soldCount != null"> • {{ product.soldCount }} Sold</template>
                            </p>
                            <p class="pos-product-card-price">{{ formatRupiah(product.priceSell) }}</p>
                        </div>
                    </div>
                    <!-- Customization: Cup Size, Ice Level, Sugar Level -->
                    <div class="pos-product-card-options">
                        <div class="pos-option-row">
                            <span class="pos-option-label">Cup Size</span>
                            <div class="pos-option-btns">
                                <button
                                    v-for="opt in ['S', 'M', 'L']"
                                    :key="opt"
                                    type="button"
                                    class="pos-option-btn"
                                    :class="{ active: getCardOption(product.id, 'cupSize') === opt }"
                                    :disabled="getProductStock(product) === 0"
                                    @click="setCardOption(product.id, 'cupSize', opt)"
                                >
                                    {{ opt }}
                                </button>
                            </div>
                        </div>
                        <div class="pos-option-row">
                            <span class="pos-option-label">Ice Level</span>
                            <div class="pos-option-btns">
                                <button
                                    v-for="opt in ['30', '60', '100']"
                                    :key="opt"
                                    type="button"
                                    class="pos-option-btn"
                                    :class="{ active: getCardOption(product.id, 'iceLevel') === opt }"
                                    :disabled="getProductStock(product) === 0"
                                    @click="setCardOption(product.id, 'iceLevel', opt)"
                                >
                                    {{ opt }}
                                </button>
                            </div>
                        </div>
                        <div class="pos-option-row">
                            <span class="pos-option-label">Sugar Level</span>
                            <div class="pos-option-btns">
                                <button
                                    v-for="opt in ['30', '60', '100']"
                                    :key="opt"
                                    type="button"
                                    class="pos-option-btn"
                                    :class="{ active: getCardOption(product.id, 'sugarLevel') === opt }"
                                    :disabled="getProductStock(product) === 0"
                                    @click="setCardOption(product.id, 'sugarLevel', opt)"
                                >
                                    {{ opt }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- Amount + Add To Cart -->
                    <div class="pos-product-card-actions">
                        <div class="pos-amount-row">
                            <span class="pos-option-label">Amount</span>
                            <div class="pos-amount-controls">
                                <button
                                    type="button"
                                    class="pos-amount-btn minus"
                                    :disabled="getProductStock(product) === 0 || getCardOption(product.id, 'amount') <= 0"
                                    @click="changeCardAmount(product.id, -1)"
                                >
                                    −
                                </button>
                                <span class="pos-amount-value">{{ getCardOption(product.id, 'amount') }}</span>
                                <button
                                    type="button"
                                    class="pos-amount-btn plus"
                                    :disabled="getProductStock(product) === 0 || getCardOption(product.id, 'amount') >= getProductStock(product)"
                                    @click="changeCardAmount(product.id, 1)"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="pos-add-to-cart-btn"
                            :disabled="getProductStock(product) === 0 || getCardOption(product.id, 'amount') <= 0"
                            @click="addProductToCart(product)"
                        >
                            Add To Cart
                        </button>
                    </div>
                    </div>
                </article>
            </div>

            <div
                v-if="!productLoading && !products.length"
                class="col-12 text-center mt-5"
            >
                <p>Tidak ada produk yang tersedia di gudang ini.</p>
            </div>
          </div>
        </div>

        <div
          class="d-flex justify-content-center mt-4"
          v-if="!productLoading && products.length > 0"
        >
          <Paginator
            :rows="productParams.rows"
            :totalRecords="totalProducts"
            :rowsPerPageOptions="[6, 12, 18]"
            @page="onProductPage"
            :first="productParams.first"
          ></Paginator>
        </div>
      </div>
    </section>

    <aside class="pos-bill-aside">
      <div class="pos-bill-inner">
        <div class="pos-bill-header">
          <h4>Bill Details</h4>
          <div class="d-flex align-items-center gap-2">
            <span class="pos-bill-number">#{{ billNumber }}</span>
            <button type="button" class="pos-btn-clear" @click="clearOrder">
              Clear All
            </button>
          </div>
        </div>
        <div class="pos-customer-name-wrap">
          <label class="pos-customer-label">Customer Name</label>
          <span class="pos-customer-value">{{
            selectedCustomerName || "—"
          }}</span>
        </div>
        <ul class="order-list mt-4 mb-4">
          <li
            class="d-flex justify-content-between align-items-center mb-3 mt-3"
            v-for="(item, index) in currentOrderItems"
            :key="item.productId"
          >
            <div class="item-info">
              <img
                :src="
                  getProductImage(item.product?.image) ||
                  '/img/branding/logo.png'
                "
                :alt="
                  item.product && item.product.name ? item.product.name : 'Logo'
                "
                @error="
                  (event) => (event.target.src = '/img/branding/logo.png')
                "
                class="img-fluid"
              />
              <div class="item-details">
                <span class="item-name">{{ item.product?.name }}</span
                ><br />
                <span class="item-price">{{
                  formatRupiah(item.quantity * item.price)
                }}</span>
              </div>
            </div>
            <div
              class="quantity-controls d-flex justify-content-center align-items-center"
            >
              <button
                @click="decreaseQuantity(index)"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{{ item.quantity }}</span>
              <button
                @click="increaseQuantity(index)"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </li>
          <li v-if="currentOrderItems.length === 0" class="text-center w-100">
            <p>No items in order.</p>
          </li>
        </ul>
        <div class="order-summary pos-order-summary">
          <div>
            <span>Item ({{ currentOrderItems.length }} Items)</span>
            <span>{{ formatRupiah(subtotal) }}</span>
          </div>
          <div>
            <span>Subtotal</span>
            <span>{{ formatRupiah(subtotal) }}</span>
          </div>
          <div>
            <span>Discount</span>
            <span>-{{ formatRupiah(discountAmount) }}</span>
          </div>
          <div>
            <span>Tax ({{ form.taxPercent || 0 }}%)</span>
            <span>{{ formatRupiah(taxAmount) }}</span>
          </div>
          <div class="total">
            <span>Total</span>
            <span>{{ formatRupiah(total) }}</span>
          </div>
        </div>
        <div class="pos-select-table-wrap">
          <label class="pos-select-table-label">Select Table</label>
          <button type="button" class="pos-select-table-btn">Pilih Meja</button>
        </div>
        <div class="payment-methods">
          <h5>Select Payment</h5>
          <div class="pos-payment-btns">
            <button
              type="button"
              class="payment-btn"
              :class="{ active: form.paymentMethod === 'cash' }"
              @click="form.paymentMethod = 'cash'"
            >
              <i class="ri-cash-line"></i>
              <span>Pay with Cash</span>
            </button>
            <button
              type="button"
              class="payment-btn"
              :class="{ active: form.paymentMethod === 'card' }"
              @click="form.paymentMethod = 'card'"
            >
              <i class="ri-bank-card-line"></i>
              <span>Pay with Card</span>
            </button>
            <button
              type="button"
              class="payment-btn"
              :class="{ active: form.paymentMethod === 'transfer' }"
              @click="form.paymentMethod = 'transfer'"
            >
              <i class="ri-exchange-dollar-line"></i>
              <span>Transfer</span>
            </button>
          </div>
        </div>
        <button
          class="btn-print pos-process-btn"
          type="button"
          @click="saveBills"
          :disabled="loading"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          {{ loading ? "Menyimpan..." : "Process Transaction" }}
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "pos",
  middleware: ["auth"],
});

import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useSalesOrderStore } from "~/stores/sales-order";
import { useCustomerStore } from "~/stores/customer";
import { usePerusahaanStore } from "~/stores/perusahaan";
import { useCabangStore } from "~/stores/cabang";
import { useProductStore } from "~/stores/product";
import { useWarehouseStore } from "~/stores/warehouse";
import { useStocksStore } from "~/stores/stocks";
import { useUserStore } from "~/stores/user";
import vSelect from "vue-select";
import CustomSelect2 from "~/components/CustomSelect2.vue";
import Dropdown from "primevue/dropdown";
import Paginator from "primevue/paginator";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import "vue-select/dist/vue-select.css";
import { useDebounceFn } from "@vueuse/core";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const config = useRuntimeConfig();
const router = useRouter();

// Store
const myDataTableRef = ref(null);
const salesOrderStore = useSalesOrderStore();
const customerStore = useCustomerStore();
const perusahaanStore = usePerusahaanStore();
const warehouseStore = useWarehouseStore();
const cabangStore = useCabangStore();
const productStore = useProductStore();
const stockStore = useStocksStore();
const userStore = useUserStore();
const formatRupiah = useFormatRupiah();

const {
  salesOrders,
  loading,
  totalRecords,
  params,
  form,
  isEditMode,
  showModal,
  validationErrors,
  customerProducts,
} = storeToRefs(salesOrderStore);
const { customers } = storeToRefs(customerStore);
const { perusahaans } = storeToRefs(perusahaanStore);
const { cabangs } = storeToRefs(cabangStore);
const { warehouses } = storeToRefs(warehouseStore);
const {
  products,
  loading: productLoading,
  totalRecords: totalProducts,
  params: productParams,
} = storeToRefs(productStore);
const { user } = storeToRefs(userStore);

const avatarImgError = ref(false);

const userDisplayName = computed(() => {
  const u = user.value;
  if (!u) return "User";
  return u.fullName ?? u.full_name ?? "User";
});

const userAvatarUrl = computed(() => {
  if (avatarImgError.value) return null;
  const u = user.value;
  return u?.avatar ?? u?.avatarUrl ?? u?.avatar_url ?? null;
});

const userInitials = computed(() => {
  const name = userDisplayName.value;
  if (!name || name === "User") return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

function onAvatarImgError() {
  avatarImgError.value = true;
}

// State
const productSearchQuery = ref("");
const globalFilterValue = ref("");
const attachmentPreview = ref(null);
const activeCategory = ref("product");

const posCategories = [
  { label: "Product", value: "product" },
  { label: "Services", value: "services" },
  { label: "Delivery, Installation, Dismantle (DID)", value: "did" },
];

const billNumber = ref(String(Math.floor(100000 + Math.random() * 900000)));

// State per-product card: cupSize, iceLevel, sugarLevel, amount
const productCardOptions = ref({});

const defaultCardOptions = () => ({
  cupSize: "S",
  iceLevel: "100",
  sugarLevel: "100",
  amount: 1,
});

function getCardOption(productId, key) {
  const opts = productCardOptions.value[productId] || defaultCardOptions();
  return opts[key] ?? defaultCardOptions()[key];
}

function setCardOption(productId, key, value) {
  if (!productCardOptions.value[productId]) {
    productCardOptions.value[productId] = { ...defaultCardOptions() };
  }
  productCardOptions.value[productId][key] = value;
}

function changeCardAmount(productId, delta) {
  if (!productCardOptions.value[productId]) {
    productCardOptions.value[productId] = { ...defaultCardOptions() };
  }
  const opts = productCardOptions.value[productId];
  const next = Math.max(0, (opts.amount || 1) + delta);
  opts.amount = next;
}

function addProductToCart(product) {
  if (!form.value.salesOrderItems) {
    form.value.salesOrderItems = [];
  }
  const stockQty = getProductStock(product);
  const amount = getCardOption(product.id, "amount") || 1;
  if (stockQty === 0 || amount <= 0) return;
  const cupSize = getCardOption(product.id, "cupSize");
  const iceLevel = getCardOption(product.id, "iceLevel");
  const sugarLevel = getCardOption(product.id, "sugarLevel");
  const description = `Cup: ${cupSize}, Ice: ${iceLevel}%, Sugar: ${sugarLevel}%`;
  const existingIndex = form.value.salesOrderItems.findIndex(
    (item) => item.productId === product.id,
  );
  if (existingIndex > -1) {
    const item = form.value.salesOrderItems[existingIndex];
    const newQty = item.quantity + amount;
    if (newQty > stockQty) {
      toast.fire({
        icon: "warning",
        title: "Jumlah melebihi stok yang tersedia.",
      });
      return;
    }
    item.quantity = newQty;
    if (item.description) item.description = description;
  } else {
    form.value.salesOrderItems.push({
      productId: product.id,
      quantity: amount,
      price: product.priceSell || 0,
      description,
      subtotal: (product.priceSell || 0) * amount,
    });
  }
  setCardOption(product.id, "amount", 1);
}

const formattedDate = computed(() => {
  const d = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
});

const selectedCustomerName = computed(() => {
  if (!form.value.customerId || !customers.value?.length) return "";
  const c = customers.value.find((x) => x.id === form.value.customerId);
  return c?.name || "";
});

const getProductImage = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") {
    return null;
  }
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  if (!config.public.apiBase) {
    return imagePath;
  }
  const origin = new URL(config.public.apiBase).origin;
  const imageUrl = `${origin}/${imagePath}`;
  return imageUrl;
};

const getProductStock = (product) => {
  if (!product.stocks || product.stocks.length === 0) {
    return 0;
  }

  // Jika ada warehouse yang dipilih, tampilkan stok untuk warehouse tersebut
  if (form.value.warehouseId) {
    const warehouseStock = product.stocks.find(
      (stock) => stock.warehouseId === form.value.warehouseId,
    );
    return warehouseStock ? Math.floor(warehouseStock.quantity) : 0;
  }

  // Jika tidak ada warehouse yang dipilih, tampilkan total stok dari semua warehouse
  const totalStock = product.stocks.reduce(
    (total, stock) => total + Number(stock.quantity),
    0,
  );
  return Math.floor(totalStock);
};

const isProductInOrder = (productId) => {
  return (
    form.value.salesOrderItems &&
    form.value.salesOrderItems.some((item) => item.productId === productId)
  );
};

const toggleProductInOrder = (product) => {
  if (!form.value.salesOrderItems) {
    form.value.salesOrderItems = [];
  }
  const itemIndex = form.value.salesOrderItems.findIndex(
    (item) => item.productId === product.id,
  );

  if (itemIndex > -1) {
    salesOrderStore.removeItem(itemIndex);
  } else {
    const stockQty = getProductStock(product);
    if (stockQty > 0) {
      form.value.salesOrderItems.push({
        productId: product.id,
        quantity: 1,
        price: product.priceSell || 0,
        description: "",
        subtotal: product.priceSell || 0,
      });
    } else {
      toast.fire({
        icon: "warning",
        title: "Produk ini kehabisan stok.",
      });
    }
  }
};

const increaseQuantity = (index) => {
  const item = form.value.salesOrderItems[index];
  const product = products.value.find((p) => p.id === item.productId);

  if (product) {
    const stockQty = getProductStock(product);
    if (item.quantity < stockQty) {
      item.quantity++;
    } else {
      toast.fire({
        icon: "warning",
        title: "Jumlah melebihi stok yang tersedia.",
      });
    }
  } else {
    item.quantity++; // Fallback if stock info is not available
  }
  calculateSubtotal(index);
};

const decreaseQuantity = (index) => {
  const item = form.value.salesOrderItems[index];
  item.quantity--;
  if (item.quantity <= 0) {
    salesOrderStore.removeItem(index);
  } else {
    calculateSubtotal(index);
  }
};

const currentOrderItems = computed(() => {
  if (!form.value.salesOrderItems) return [];
  return form.value.salesOrderItems
    .map((item) => {
      const product = products.value.find((p) => p.id === item.productId);
      return {
        ...item,
        product: product,
      };
    })
    .filter((item) => item.product);
});

const subtotal = computed(() => {
  return currentOrderItems.value.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );
});

const discountAmount = computed(() => {
  const discountPercent = Number(form.value.discountPercent) || 0;
  return subtotal.value * (discountPercent / 100);
});

const taxAmount = computed(() => {
  const taxPercent = Number(form.value.taxPercent) || 0;
  return (subtotal.value - discountAmount.value) * (taxPercent / 100);
});

const total = computed(() => {
  return subtotal.value - discountAmount.value + taxAmount.value;
});

const clearOrder = () => {
  form.value.salesOrderItems = [];
};

const saveBills = async () => {
  if (
    !form.value.perusahaanId ||
    !form.value.cabangId ||
    !form.value.warehouseId ||
    !form.value.customerId
  ) {
    toast.fire({
      icon: "error",
      title:
        "Harap lengkapi pilihan Perusahaan, Cabang, Gudang, dan Pelanggan.",
    });
    return;
  }

  if (!form.value.salesOrderItems || form.value.salesOrderItems.length === 0) {
    toast.fire({
      icon: "error",
      title: "Tidak ada item dalam pesanan.",
    });
    return;
  }

  if (!form.value.paymentMethod) {
    toast.fire({
      icon: "error",
      title: "Harap pilih metode pembayaran.",
    });
    return;
  }

  // Add warehouseId to each item before saving
  const warehouseId = form.value.warehouseId;
  form.value.salesOrderItems.forEach((item) => {
    item.warehouseId = warehouseId;
  });

  await salesOrderStore.saveSalesOrder();

  if (salesOrderStore.validationErrors.length === 0) {
    clearOrder();
    form.value.perusahaanId = null;
    form.value.cabangId = null;
    form.value.warehouseId = null;
    form.value.customerId = null;
    form.value.paymentMethod = "";
    billNumber.value = String(Math.floor(100000 + Math.random() * 900000));
    toast.fire({
      icon: "success",
      title: "Pesanan berhasil disimpan.",
    });
  } else {
    toast.fire({
      icon: "error",
      title: "Terjadi kesalahan saat menyimpan pesanan.",
    });
  }
};

const grandTotal = computed(() => {
  if (!form.value || !form.value.salesOrderItems) return 0;

  const totalItems = form.value.salesOrderItems.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.price) || 0;
    return total + quantity * unitPrice;
  }, 0);

  const discountPercent = Number(form.value.discountPercent) || 0;
  const taxPercent = Number(form.value.taxPercent) || 0;

  const discountAmount = totalItems * (discountPercent / 100);
  const totalAfterDiscount = totalItems - discountAmount;
  const taxAmount = totalAfterDiscount * (taxPercent / 100);

  return totalAfterDiscount + taxAmount;
});

const paymentMethodOptions = [
  { label: "Cash", value: "cash" },
  { label: "Transfer", value: "transfer" },
  { label: "QRIS", value: "qris" },
  { label: "Card", value: "card" },
];

let modalInstance = null;
onMounted(() => {
  salesOrderStore.resetForm("pos");
  const today = new Date().toISOString().split("T")[0];
  form.value.date = today;
  form.value.dueDate = today;

  salesOrderStore.fetchSalesOrders();
  customerStore.fetchCustomers();
  perusahaanStore.fetchPerusahaans();
  cabangStore.fetchCabangs();
  productStore.params.rows = 6;
  productStore.fetchProducts();
  warehouseStore.fetchWarehouses();
  userStore.loadUser();

  const modalElement = document.getElementById("SalesOrderModal");
  if (modalElement) {
    modalInstance = new bootstrap.Modal(modalElement);
  }
});

watch(
  () => form.value.perusahaanId,
  (newPerusahaanId) => {
    if (newPerusahaanId) {
      const selectedCompany = perusahaans.value.find(
        (p) => p.id === newPerusahaanId,
      );
      if (selectedCompany) {
        form.value.up = selectedCompany.nmPerusahaan;
      }
      if (!isEditMode.value) {
        form.value.cabangId = null;
      }
    } else {
      form.value.up = "";
    }
  },
);

watch(
  () => form.value.customerId,
  (newCustomerId, oldCustomerId) => {
    if (newCustomerId && oldCustomerId && newCustomerId !== oldCustomerId) {
      salesOrderStore.fetchProductsForCustomer(newCustomerId);

      form.value.salesOrderItems = [];
      salesOrderStore.addItem();
    } else if (newCustomerId && !oldCustomerId) {
      salesOrderStore.fetchProductsForCustomer(newCustomerId);
    } else if (!newCustomerId) {
      salesOrderStore.customerProducts = [];
      form.value.salesOrderItems = [];
      salesOrderStore.addItem();
    }
  },
);

watch(
  () => salesOrderStore.customerProducts,
  (newProducts) => {
    if (form.value.salesOrderItems && newProducts) {
      form.value.salesOrderItems.forEach((item) => {
        const productExists = newProducts.some((p) => p.id === item.productId);
        if (!productExists) {
          item.productId = null;
          item.price = 0;
          item.quantity = 1;
          item.subtotal = 0;
        }
      });
    }
  },
  { deep: true },
);

watch(
  () => form.value.warehouseId,
  (newWarehouseId) => {
    if (newWarehouseId) {
      productStore.setWarehouseFilter(newWarehouseId);
    } else {
      productStore.setWarehouseFilter(null);
    }
  },
);

const filteredCabangs = computed(() => {
  if (!form.value.perusahaanId || !cabangs.value) return [];
  return cabangs.value.filter(
    (c) => c.perusahaanId === form.value.perusahaanId,
  );
});

const debouncedProductSearch = useDebounceFn(() => {
  productStore.setSearch(productSearchQuery.value);
}, 500);
watch(productSearchQuery, debouncedProductSearch);

const debouncedSearch = useDebounceFn(() => {
  salesOrderStore.setSearch(globalFilterValue.value);
}, 500);
watch(globalFilterValue, debouncedSearch);

const onPage = (event) => salesOrderStore.setPagination(event);
const handleRowsChange = () => {
  params.value.first = 0;
  salesOrderStore.fetchSalesOrders();
};

const onProductPage = (event) => {
  productParams.value.first = event.first;
  productParams.value.rows = event.rows;
  productStore.fetchProducts();
};

const isFirstPage = computed(() => productParams.value.first === 0);

const isLastPage = computed(() => {
  const total = totalProducts.value;
  const { first, rows } = productParams.value;
  return first + rows >= total;
});

const nextPage = () => {
  if (!isLastPage.value) {
    productParams.value.first += productParams.value.rows;
    productStore.fetchProducts();
  }
};

const prevPage = () => {
  if (!isFirstPage.value) {
    productParams.value.first -= productParams.value.rows;
    productStore.fetchProducts();
  }
};

const exportData = (format) => {
  if (format === "csv") myDataTableRef.value.exportCSV();
};

function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    form.value.attachment = file;
    attachmentPreview.value = URL.createObjectURL(file);
  } else {
    form.value.attachment = null;
    attachmentPreview.value = null;
  }
}

const onProductChange = (index) => {
  const selectedProductId = form.value.salesOrderItems[index].productId;
  const selectedProduct = customerProducts.value.find(
    (p) => p.id === selectedProductId,
  );

  if (selectedProduct) {
    const item = form.value.salesOrderItems[index];
    item.price = Number(selectedProduct.priceSell) || 0;
    calculateSubtotal(index);
    updateStockInfo(index);
  }
};

const onQuantityChange = (index) => {
  calculateSubtotal(index);
};

const calculateSubtotal = (index) => {
  const item = form.value.salesOrderItems[index];
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.price) || 0;
  item.subtotal = quantity * unitPrice;
};

const updateStockInfo = async (index) => {
  const item = form.value.salesOrderItems[index];
  if (item.productId && item.warehouseId) {
    try {
      stockStore.params.search = ""; // Reset search if any
      stockStore.params.rows = 1; // We only need one record
      const response = await stockStore.fetchStocksPaginated({
        productId: item.productId,
        warehouseId: item.warehouseId,
      });
      if (response && response.data && response.data.length > 0) {
        item.stock = response.data[0];
      } else {
        item.stock = { quantity: 0 };
      }
    } catch (error) {
      console.error("Failed to fetch stock info:", error);
      item.stock = { quantity: 0 };
    }
  } else {
    item.stock = { quantity: 0 };
  }
};
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 768px) {
  .card-body {
    padding: 16px;
  }

  .form-label {
    font-size: 13px;
    margin-bottom: 6px;
  }
}

@media (max-width: 576px) {
  .card-body {
    padding: 12px;
  }
}
</style>
