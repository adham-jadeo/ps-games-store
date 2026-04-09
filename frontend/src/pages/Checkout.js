import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { orderAPI } from "../services/api";
import "./Checkout.css";

function Checkout() {
  const { cartItems, total, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    street: user?.street || "",
    city: user?.city || "",
    state: user?.state || "",
    zip: user?.zip || "",
    country: user?.country || "",
  });

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setProcessing(true);

    try {
      // Create order
      await orderAPI.create({
        shippingAddress: formData,
      });

      // Clear cart
      await clearCart();

      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create order");
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <p>Your cart is empty. Please add items before checking out.</p>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Shipping Information</h2>

            {error && <div className="error-message">{error}</div>}

            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={formData.street}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="state"
              placeholder="State/Province"
              value={formData.state}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="zip"
              placeholder="Zip Code"
              value={formData.zip}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={processing}
              className="place-order-btn"
            >
              {processing ? "Processing..." : "Place Order"}
            </button>
          </form>

          <div className="order-summary-checkout">
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <span className="item-title">
                  {item.product.title} x {item.quantity}
                </span>
                <span className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="total-section">
              <span>Total:</span>
              <span className="total-price">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
