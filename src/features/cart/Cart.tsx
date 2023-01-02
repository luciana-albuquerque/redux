import React from 'react';
import classNames from 'classnames';
import { getTotalPrice, removeFromCart, updateQuantity, checkoutCart} from './cartSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import styles from './Cart.module.css';

export function Cart() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.products);
  const cartItems = useAppSelector((state) => state.cart.items);
  const totalPrice = useAppSelector(getTotalPrice)
  const checkoutState = useAppSelector(state => state.cart.checkoutState)
  const errorMessage = useAppSelector(state => state.cart.errorMessage)

  // T Y P E S C R I P T -  E v e n t s
  const handleQtyChange = (e: React.FocusEvent<HTMLInputElement>, id: string) => {
    const newQuantity = Number(e.target.value) ?? 0;
    dispatch(updateQuantity({id, quantity: newQuantity}))
  }

  function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(checkoutCart())
  }

  const tableClasses = classNames({
    [styles.table]: true,
    [styles.checkoutError]: checkoutState === 'ERROR',
    [styles.checkoutLoading]: checkoutState === 'LOADING'
  })

  return (
    <main className='page'>
      <h1>Shopping Cart</h1>
      <table className={tableClasses}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(cartItems).map(([id, quantity]) => (
            <tr key={id}>
              <td>{products[id]?.name}</td>
              <td>
                <input type='text' className={styles.input} defaultValue={quantity} onBlur={(e) => handleQtyChange(e, id) } />
              </td>
              <td>{ products[id].price * quantity} </td>
              <td>
                <button onClick={()=> dispatch(removeFromCart(id)) } aria-label={`Remove ${products[id]?.name} from Shopping Cart`}>
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td></td>
            <td className={styles.total}>${totalPrice}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      {(checkoutState === 'LOADING') && <p>Loading...</p>}
      <form onSubmit={handleCheckout}>
        {checkoutState === 'ERROR' && errorMessage ? (<p className={styles.errorBox}>{ errorMessage }</p>) : null}
        <button className={styles.button} type='submit'>
          Checkout
        </button>
      </form>
    </main>
  );
}
