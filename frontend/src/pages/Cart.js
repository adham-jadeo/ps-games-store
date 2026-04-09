import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./Cart.css";

function Cart() {
  const { cartItems, total, updateQuantity, removeFromCart, loadCart } =
    useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, loadCart]);

  if (!isAuthenticated) {
    return (
      <div className="cart-container">Please log in to view your cart</div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h1>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.product.image} alt={item.product.title} />

                  <div className="item-details">
                    <h3>{item.product.title}</h3>
                    <p>${item.price}</p>
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.productId,
                        Math.max(1, parseInt(e.target.value, 10) || 1),
                      )
                    }
                    className="quantity-selector"
                  />

                  <span className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="remove-btn"
                    aria-label={`Remove ${item.product.title} from cart`}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${Number(total).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${Number(total).toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="checkout-btn"
              >
                Proceed to Checkout
              </button>

              <Link to="/" className="continue-shopping-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
