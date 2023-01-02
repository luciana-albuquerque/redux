import { createSelector, createAsyncThunk, createSlice, PayloadAction, autoBatchEnhancer } from "@reduxjs/toolkit";
import { checkout, CartItems } from '../../app/api'
import { RootState } from "../../app/store";

type CheckOutState = "LOADING" | "READY" | "ERROR";
  
export interface CartState {
  items: { [productId: string]: number }
  checkoutState: CheckOutState;
  errorMessage: string;
}

const initialState: CartState = {
  items: {},
  checkoutState: "READY",
  errorMessage: '',
}

// I dont understand this generics, is it args? return? sorted?
export const checkoutCart = createAsyncThunk< { success: boolean }, undefined, {state: RootState} >('cart/checkout', async (_, thunkAPI) => {
  const state = thunkAPI.getState()
  const response = await checkout(state.cart.items);
  return response;
})

/* export function checkout() {
  return function checkoutThunk(dispatch: AppDispatch) {
    dispatch({ type: "cart/checkout/pending" });
    setTimeout(() => {
      dispatch({ type: "cart/checkout/fullfilled" });
    }, 500)
 }
} */

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const idAddedItem = action.payload;
      if (state.items[idAddedItem]) {
        state.items[idAddedItem]++
      } else {
        state.items[idAddedItem] = 1
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      const idRemovedItem = action.payload;
      delete state.items[idRemovedItem]
    },
    updateQuantity(state, action: PayloadAction<{ id: string;  quantity: number}>) {
      const { id, quantity } = action.payload;
      state.items[id] = quantity
    },
/*  this needs an extraReducer because there's no payload. I guess.  
    checkoutPending(state, action: PayloadAction<unknown>) {
      state.checkoutState = 'LOADING'
    }, */
  },
  extraReducers: function (builder) {
    builder.addCase(checkoutCart.pending, (state) => {
      state.checkoutState = 'LOADING'
    })
    builder.addCase(checkoutCart.fulfilled, (state, action: PayloadAction<{success: boolean}>) => {
      const {success} = action.payload
      if (success) {
        state.checkoutState = 'READY'
        state.items = {};
      } else {
        state.checkoutState = 'ERROR'
      }
    })
    builder.addCase(checkoutCart.rejected, (state, action) => {
      state.checkoutState = 'ERROR'
      state.errorMessage = action.error.message || ""
    })
  }
})



export const {addToCart, removeFromCart, updateQuantity} = cartSlice.actions
export default cartSlice.reducer

//Selector is a function that takes the Redux state and returns any value it wants.
//this is a selector:
/* export function getNumItems(state: RootState) {
  console.log('calling numItems')
  let numItems = 0;
  for (let id in state.cart.items) { 
    numItems += state.cart.items[id]
  }
  return numItems;
} */

export const getNumItems = createSelector(
  (state: RootState) => { state.cart.items },
  (items: any) => { //this any?
    console.log('calling memoized numItems', items)
    let numItems = 0;
    for (let id in items) { 
      numItems += items[id]
    }
  return numItems;
  }
) 

export const getTotalPrice = createSelector(
  (state: RootState) => state.cart.items,
  (state: RootState) => state.products.products,
  (items, products) => {
    let total = 0;
    for (let id in items) {
      total += products[id].price * items[id]
    } 
    return total.toFixed(2)
  }
)