import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../app/api";

export interface ProductState {
  products: { [id: string]: Product}
}

const initialState: ProductState = {
  products: {}
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    receivedProducts(state, action: PayloadAction<Product[]>) {
      const products = action.payload;
      products.forEach( product => state.products[product.id] = product)
    }
  }
})
// * redux toolkit automaticly generated actionCreator for receivedProducts, i just need to dispatch
export const { receivedProducts } = productsSlice.actions;
export default productsSlice.reducer