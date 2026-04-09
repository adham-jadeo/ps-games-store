import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./Orders.css";

const HIDDEN_CUSTOMER_ORDERS_KEY = "hiddenCustomerOrders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getAll();
        const hiddenOrderIds = JSON.parse(
          localStorage.getItem(HIDDEN_CUSTOMER_ORDERS_KEY) || "[]",
        );
        setHiddenCount(hiddenOrderIds.length);
        setOrders(
          response.data.filter((order) => !hiddenOrderIds.includes(order.id)),
        );
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const handleCancelOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    setActionMessage("");

    try {
      const response = await orderAPI.cancel(orderId);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? response.data : order,
        ),
      );
      setActionMessage("Order cancelled successfully.");
    } catch (error) {
      setActionMessage(
        error.response?.data?.error || "Failed to cancel the order.",
      );
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleConfirmReceived = async (orderId) => {
    setProcessingOrderId(orderId);
    setActionMessage("");

    try {
      const response = await orderAPI.confirmReceived(orderId);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? response.data : order,
        ),
      );
      setActionMessage("Order marked as received.");
    } catch (error) {
      setActionMessage(
        error.response?.data?.error || "Failed to confirm delivery.",
      );
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    setActionMessage("");

    try {
      const hiddenOrderIds = JSON.parse(
        localStorage.getItem(HIDDEN_CUSTOMER_ORDERS_KEY) || "[]",
      );
      const updatedHiddenOrderIds = Array.from(
        new Set([...hiddenOrderIds, orderId]),
      );
      localStorage.setItem(
        HIDDEN_CUSTOMER_ORDERS_KEY,
        JSON.stringify(updatedHiddenOrderIds),
      );
      setHiddenCount(updatedHiddenOrderIds.length);
      setOrders((currentOrders) =>
        currentOrders.filter((order) => order.id !== orderId),
      );
      setActionMessage("Order hidden from your history.");
    } catch (error) {
      setActionMessage(
        error.response?.data?.error || "Failed to delete order.",
      );
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRestoreHiddenOrders = async () => {
    localStorage.removeItem(HIDDEN_CUSTOMER_ORDERS_KEY);
    setHiddenCount(0);
    setActionMessage("Hidden orders restored.");
    setLoading(true);

    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      setActionMessage("Failed to restore hidden orders.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders">
      <div className="container">
        <h1>My Orders</h1>

        {hiddenCount > 0 && (
          <button
            className="restore-hidden-btn"
            onClick={handleRestoreHiddenOrders}
          >
            Show Hidden Orders ({hiddenCount})
          </button>
        )}

        {actionMessage && <div className="orders-message">{actionMessage}</div>}

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`order-status ${order.status}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span>{item.title}</span>
                      <span>
                        ${item.price} x {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: ${Number(order.totalAmount).toFixed(2)}</strong>
                  </div>

                  {order.status === "pending" && (
                    <button
                      className="order-action-btn cancel-order-btn"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={processingOrderId === order.id}
                    >
                      {processingOrderId === order.id
                        ? "Cancelling..."
                        : "Cancel Order"}
                    </button>
                  )}

                  {order.status === "shipped" && (
                    <button
                      className="order-action-btn confirm-order-btn"
                      onClick={() => handleConfirmReceived(order.id)}
                      disabled={processingOrderId === order.id}
                    >
                      {processingOrderId === order.id
                        ? "Confirming..."
                        : "I Received My Order"}
                    </button>
                  )}

                  {["delivered", "cancelled"].includes(order.status) && (
                    <button
                      className="order-action-btn delete-order-btn"
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={processingOrderId === order.id}
                    >
                      {processingOrderId === order.id ? "Hiding..." : "Hide"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
