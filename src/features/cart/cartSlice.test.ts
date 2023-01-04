import cartReducer, { addToCart, CartState, getNumItems, getMemoizedNumItems, getTotalPrice, removeFromCart, updateQuantity } from './cartSlice';
import products from '../../../public/products.json'
import type { RootState } from "../../app/store";
import * as api from '../../app/api';

jest.mock("../../app/api.ts", () => {
  return {
    async getProducts() {
      return [];
    },
    async checkout(items: api.CartItems = {}) {
      const empty = Object.keys(items).length === 0;
      if (empty) throw new Error("Must include cart items");
      if (items.badItem > 0) return { success: false}
      return { success: true}
    }
  }
})

test("checkout should work", async () => {
  await api.checkout({ fakeItem: 4 })
})

describe("cart reducer", () => {
  test("an empty action", () => {
    const initialState = undefined;
    const action = { type: "" }
    const state = cartReducer(initialState, action);
    expect(state).toEqual({
      checkoutState: "READY",
      errorMessage: '',
      items: {}
    })
  })
  test("addToCart", () => {
    const initialState = undefined;
    const action = addToCart(products[0].id)
    const state = cartReducer(initialState, action);
    expect(state).toEqual({
      checkoutState: "READY",
      errorMessage: '',
      items: {[products[0].id]: 1}
    })
  })
  test("removeFromCart", () => {
    const initialState: CartState = {
      checkoutState: "READY",
      errorMessage: '',
      items: {
        [products[0].id]: 1,
        [products[1].id]: 1,
      }
    }
    const action = removeFromCart(products[0].id)
    const state = cartReducer(initialState, action);
    expect(state).toEqual({
      checkoutState: "READY",
      errorMessage: '',
      items: {[products[1].id]: 1}
    })
  })
  test("updateQuantity", () => {
    const initialState: CartState = {
      checkoutState: "READY",
      errorMessage: '',
      items: {
        [products[0].id]: 1,
        [products[1].id]: 1,
      }
    }
    const action = updateQuantity({ id: products[0].id as string, quantity: 5 })
    const state = cartReducer(initialState, action);
    expect(state.items[products[0].id]).toEqual(5)
  })
})

describe("selectors", () => {
  describe("getNumItems", () => {
    it("should return 0 if its empty", () => {
      const cart: CartState = {
        checkoutState: "READY",
        errorMessage: '',
        items: {}
      }
      const result = getNumItems({ cart } as RootState);
      expect(result).toEqual(0)
    })
    it("should return the total of items", () => {
      const cart: CartState = {
        checkoutState: "READY",
        errorMessage: '',
        items: {
          [products[0].id]: 1,
          [products[1].id]: 3,
        }
      }
      const result = getNumItems({ cart } as RootState);
      expect(result).toEqual(4)
    })
  })
  describe("getNumItems", () => {
    it("should return 0 with no items", () => {
      const cart: CartState = {
        checkoutState: "READY",
        errorMessage: '',
        items: {}
      }
      const result = getMemoizedNumItems({ cart } as RootState);
      expect(result).toEqual(0)
    })
    it("should return total of items", () => {
      const cart: CartState = {
        checkoutState: "READY",
        errorMessage: '',
        items: {
          [products[0].id]: 1,
          [products[1].id]: 3,
        }
      }
      const result = getMemoizedNumItems({ cart } as RootState);
      expect(result).toEqual(4)
    })
    it("should not compute again with the same state", () => {
      const cart: CartState = {
        checkoutState: "READY",
        errorMessage: '',
        items: {
          [products[0].id]: 1,
          [products[1].id]: 3,
        }
      }
      getMemoizedNumItems.resetRecomputations()
      getMemoizedNumItems({ cart } as RootState);
      expect(getMemoizedNumItems.recomputations()).toEqual(1)
      getMemoizedNumItems({ cart } as RootState);
      getMemoizedNumItems({ cart } as RootState);
      getMemoizedNumItems({ cart } as RootState);
      expect(getMemoizedNumItems.recomputations()).toEqual(1) 
    })
    it("should recompute with new state", () => {
      const cart: CartState = {
        checkoutState: "READY",
        errorMessage: '',
        items: {
          [products[0].id]: 1,
          [products[1].id]: 3,
        }
      }
      getMemoizedNumItems.resetRecomputations()
      getMemoizedNumItems({ cart } as RootState);
      expect(getMemoizedNumItems.recomputations()).toEqual(1);
      cart.items = {[products[2].id]: 3}
      getMemoizedNumItems({ cart } as RootState);
      expect(getMemoizedNumItems.recomputations()).toEqual(2);
    })
  })
  describe("getTotalPrice", () => {
    it("should return 0 if cart is empty", () => {
      const state: RootState = {
        cart: {checkoutState: "READY", errorMessage: '', items: {}},
        products: {products: {}}
      }
      const result = getTotalPrice(state);
      expect(result).toEqual("0.00")
    })
    it("should add up prices", () => {
      const state: RootState = {
        cart: {
          checkoutState: "READY", errorMessage: '', items: {
            [products[0].id]: 1,
            [products[1].id]: 1,
          }
        },
        products: {
          products: {
            [products[0].id]: products[0],
            [products[1].id]: products[1]
        }}
      }
      const result = getTotalPrice(state);
      expect(result).toEqual('11.08')
    })
    //voltar para aula 10 e fazer:
    it.todo("should change the price if the quantity of same item changes")
    it.todo("should not computed again with same prices")
    it.todo("should recomputed for new products")
    //use getTotalPrice({...state}) otherwise it doesnt know the state obj has changed.
    it.todo("should recomputed when cart changes")  
  })
})