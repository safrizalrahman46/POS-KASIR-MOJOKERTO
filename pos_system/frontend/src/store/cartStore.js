import { create } from 'zustand'

const TAX_RATE = 0.11

export const useCartStore = create((set, get) => ({
  items: [],
  customerName: '',
  voucherCode: null,
  voucherDiscount: 0,

  addItem: (product) => {
    const items = get().items
    const existing = items.find((i) => i.product.id === product.id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      })
    } else {
      set({
        items: [
          ...items,
          {
            product,
            quantity: 1,
            discount_type: 'none',
            discount_value: 0,
          },
        ],
      })
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.product.id !== productId) })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    })
  },

  updateItemDiscount: (productId, type, value) => {
    set({
      items: get().items.map((i) =>
        i.product.id === productId
          ? { ...i, discount_type: type, discount_value: value }
          : i
      ),
    })
  },

  setCustomerName: (name) => set({ customerName: name }),

  setVoucherCode: (code) => set({ voucherCode: code }),

  setVoucherDiscount: (amount) => set({ voucherDiscount: amount }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity
    }, 0)
  },

  getItemDiscounts: () => {
    return get().items.reduce((sum, item) => {
      if (item.discount_type === 'none') return sum
      const lineTotal = item.product.price * item.quantity
      if (item.discount_type === 'percent') {
        return sum + (lineTotal * Math.min(item.discount_value, 100)) / 100
      }
      if (item.discount_type === 'fixed') {
        return sum + Math.min(item.discount_value, lineTotal)
      }
      return sum
    }, 0)
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    const itemDiscounts = get().getItemDiscounts()
    const afterItemDiscounts = subtotal - itemDiscounts
    const afterVoucher = Math.max(afterItemDiscounts - get().voucherDiscount, 0)
    const tax = afterVoucher * TAX_RATE
    return afterVoucher + tax
  },

  clearCart: () =>
    set({
      items: [],
      customerName: '',
      voucherCode: null,
      voucherDiscount: 0,
    }),
}))
