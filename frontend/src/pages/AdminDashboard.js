import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { adminAPI, productAPI } from "../services/api";
import "./AdminDashboard.css";

const HIDDEN_ADMIN_ORDERS_KEY = "hiddenAdminOrders";

function AdminDashboard() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    genre: "",
    stock: "",
    developer: "",
    publisher: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [processingProductId, setProcessingProductId] = useState(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [expandedProductIds, setExpandedProductIds] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
      adminAPI.getStats(),
      adminAPI.getOrders(),
      productAPI.getAll({ limit: 1000 }),
    ]);
    const hiddenOrderIds = JSON.parse(
      localStorage.getItem(HIDDEN_ADMIN_ORDERS_KEY) || "[]",
    );
    setHiddenCount(hiddenOrderIds.length);
    setStats(statsResponse.data);
    setProducts(productsResponse.data.products);
    setOrders(
      ordersResponse.data.filter((order) => !hiddenOrderIds.includes(order.id)),
    );
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        await fetchDashboardData();
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchDashboardData, isAuthenticated, user, navigate]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
      });
      setMessage("Product added successfully!");
      setNewProduct({
        title: "",
        description: "",
        price: "",
        image: "",
        genre: "",
        stock: "",
        developer: "",
        publisher: "",
      });
      await fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to add product");
    }
  };

  const handleExistingProductChange = (productId, field, value) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId ? { ...product, [field]: value } : product,
      ),
    );
  };

  const toggleProductExpanded = (productId) => {
    setExpandedProductIds((currentExpandedIds) =>
      currentExpandedIds.includes(productId)
        ? currentExpandedIds.filter((id) => id !== productId)
        : [...currentExpandedIds, productId],
    );
  };

  const handleUpdateProduct = async (productId) => {
    const product = products.find((item) => item.id === productId);

    setProcessingProductId(productId);
    setMessage("");

    try {
      await adminAPI.updateProduct(productId, {
        title: product.title,
        description: product.description,
        price: Math.max(0, parseFloat(product.price) || 0),
        image: product.image,
        genre: product.genre,
        stock: Math.max(0, parseInt(product.stock, 10) || 0),
        developer: product.developer,
        publisher: product.publisher,
      });
      await fetchDashboardData();
      setMessage("Product updated successfully.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to update product");
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleDeclineOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    setMessage("");

    try {
      await adminAPI.updateOrderStatus(orderId, "cancelled");
      await fetchDashboardData();
      setMessage("Order declined successfully.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to decline order");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    setMessage("");

    try {
      await adminAPI.updateOrderStatus(orderId, "shipped");
      await fetchDashboardData();
      setMessage("Order marked as on the way.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to accept order");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    setMessage("");

    try {
      const hiddenOrderIds = JSON.parse(
        localStorage.getItem(HIDDEN_ADMIN_ORDERS_KEY) || "[]",
      );
      const updatedHiddenOrderIds = Array.from(
        new Set([...hiddenOrderIds, orderId]),
      );
      localStorage.setItem(
        HIDDEN_ADMIN_ORDERS_KEY,
        JSON.stringify(updatedHiddenOrderIds),
      );
      setHiddenCount(updatedHiddenOrderIds.length);
      setOrders((currentOrders) =>
        currentOrders.filter((order) => order.id !== orderId),
      );
      setMessage("Order hidden from admin history.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to delete order");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRestoreHiddenOrders = async () => {
    localStorage.removeItem(HIDDEN_ADMIN_ORDERS_KEY);
    setHiddenCount(0);
    setMessage("Hidden admin orders restored.");

    try {
      await fetchDashboardData();
    } catch (error) {
      setMessage("Failed to restore hidden orders");
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Add Product
          </button>
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        {activeTab === "orders" && hiddenCount > 0 && (
          <button
            className="restore-hidden-btn"
            onClick={handleRestoreHiddenOrders}
          >
            Show Hidden Orders ({hiddenCount})
          </button>
        )}

        {activeTab === "dashboard" && stats && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Products</h3>
              <p className="stat-value">{stats.totalProducts}</p>
            </div>
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Orders</h3>
              <p className="stat-value">{stats.pendingOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="products-admin-layout">
            <div className="product-form-container">
              <h2>Add New Product</h2>

              <form onSubmit={handleAddProduct} className="product-form">
                <div className="form-row">
                  <input
                    type="text"
                    name="title"
                    placeholder="Game Title"
                    value={newProduct.title}
                    onChange={handleProductChange}
                    required
                  />
                  <select
                    name="genre"
                    value={newProduct.genre}
                    onChange={handleProductChange}
                    required
                  >
                    <option value="">Select Genre</option>
                    <option value="Action">Action</option>
                    <option value="RPG">RPG</option>
                    <option value="Sports">Sports</option>
                    <option value="Racing">Racing</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Puzzle">Puzzle</option>
                    <option value="Shooter">Shooter</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>

                <textarea
                  name="description"
                  placeholder="Game description"
                  value={newProduct.description}
                  onChange={handleProductChange}
                  required
                  rows="4"
                ></textarea>

                <div className="form-row">
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={handleProductChange}
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    name="stock"
                    placeholder="Stock"
                    value={newProduct.stock}
                    onChange={handleProductChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    name="developer"
                    placeholder="Developer"
                    value={newProduct.developer}
                    onChange={handleProductChange}
                  />
                  <input
                    type="text"
                    name="publisher"
                    placeholder="Publisher"
                    value={newProduct.publisher}
                    onChange={handleProductChange}
                  />
                </div>

                <input
                  type="url"
                  name="image"
                  placeholder="Image URL"
                  value={newProduct.image}
                  onChange={handleProductChange}
                />

                <button type="submit" className="submit-Btn">
                  Add Product
                </button>
              </form>
            </div>

            <div className="stock-manager">
              <h2>Edit Products</h2>

              {products.length === 0 ? (
                <div className="no-orders-message">No products found.</div>
              ) : (
                <div className="stock-list">
                      {products.map((product) => (
                        <div key={product.id} className="stock-item">
                          <div className="stock-item-header">
                            <div className="stock-item-info">
                              <div className="stock-item-summary">
                                <img
                                  src={
                                    product.image ||
                                    "https://via.placeholder.com/60x80"
                                  }
                                  alt={product.title}
                                  className="stock-item-thumb"
                                />
                                <div>
                                  <h3>{product.title}</h3>
                                  <p>
                                    ${product.price} · Stock: {product.stock} ·
                                    ID: {product.id}
                                  </p>
                                </div>
                              </div>
                            </div>

                        <button
                          className="expand-product-btn"
                          onClick={() => toggleProductExpanded(product.id)}
                        >
                          {expandedProductIds.includes(product.id)
                            ? "Collapse"
                            : "Expand"}
                        </button>
                      </div>

                      {expandedProductIds.includes(product.id) && (
                        <>
                          <div className="product-editor-grid">
                            <input
                              type="text"
                              value={product.title}
                              onChange={(e) =>
                                handleExistingProductChange(
                                  product.id,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="Title"
                            />

                            <input
                              type="url"
                              value={product.image || ""}
                              onChange={(e) =>
                                handleExistingProductChange(
                                  product.id,
                                  "image",
                                  e.target.value,
                                )
                              }
                              placeholder="Image URL"
                            />

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.price}
                              onChange={(e) =>
                                handleExistingProductChange(
                                  product.id,
                                  "price",
                                  e.target.value,
                                )
                              }
                              placeholder="Price"
                            />

                            <input
                              type="number"
                              min="0"
                              value={product.stock}
                              onChange={(e) =>
                                handleExistingProductChange(
                                  product.id,
                                  "stock",
                                  e.target.value,
                                )
                              }
                              placeholder="Stock"
                            />

                            <select
                              value={product.genre || "Other"}
                              onChange={(e) =>
                                handleExistingProductChange(
                                  product.id,
                                  "genre",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="Action">Action</option>
                              <option value="RPG">RPG</option>
                              <option value="Sports">Sports</option>
                              <option value="Racing">Racing</option>
                              <option value="Adventure">Adventure</option>
                              <option value="Puzzle">Puzzle</option>
                              <option value="Shooter">Shooter</option>
                              <option value="Strategy">Strategy</option>
                              <option value="Other">Other</option>
                            </select>

                            <input
                              type="text"
                              value={product.developer || ""}
                              onChange={(e) =>
                                handleExistingProductChange(
                                  product.id,
                                  "developer",
                                  e.target.value,
                                )
                              }
                              placeholder="Developer"
                            />

                            <input
                              type="text"
                              value={product.publisher || ""}
                              onChange={(e) =>
                                handleExistingProductChange(
                                  product.id,
                                  "publisher",
                                  e.target.value,
                                )
                              }
                              placeholder="Publisher"
                            />

                            <textarea
                              value={product.description || ""}
                              onChange={(e) =>
                                handleExistingProductChange(
                                  product.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Description"
                              rows="3"
                              className="product-editor-description"
                            />
                          </div>

                          <div className="stock-item-controls">
                            <button
                              className="save-stock-btn"
                              onClick={() => handleUpdateProduct(product.id)}
                              disabled={processingProductId === product.id}
                            >
                              {processingProductId === product.id
                                ? "Saving..."
                                : "Save Changes"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="admin-orders-list">
            {orders.length === 0 ? (
              <div className="no-orders-message">No orders found.</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="admin-order-card">
                  <div className="admin-order-header">
                    <div>
                      <h3>Order #{order.id}</h3>
                      <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`admin-order-status ${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="admin-order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="admin-order-item">
                        <span>{item.title}</span>
                        <span>
                          ${item.price} x {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="admin-order-footer">
                    <strong>${Number(order.totalAmount).toFixed(2)}</strong>
                    <div className="admin-order-actions">
                      {["pending", "paid", "processing"].includes(
                        order.status,
                      ) && (
                        <button
                          className="accept-order-btn"
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={processingOrderId === order.id}
                        >
                          {processingOrderId === order.id
                            ? "Accepting..."
                            : "Accept Order"}
                        </button>
                      )}

                      {order.status !== "cancelled" &&
                        order.status !== "delivered" && (
                          <button
                            className="decline-order-btn"
                            onClick={() => handleDeclineOrder(order.id)}
                            disabled={processingOrderId === order.id}
                          >
                            {processingOrderId === order.id
                              ? "Declining..."
                            : "Decline Order"}
                          </button>
                        )}

                      {["delivered", "cancelled"].includes(order.status) && (
                        <button
                          className="delete-order-btn"
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={processingOrderId === order.id}
                        >
                          {processingOrderId === order.id
                            ? "Hiding..."
                            : "Hide Order"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
