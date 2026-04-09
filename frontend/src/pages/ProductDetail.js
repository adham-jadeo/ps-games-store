import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated, user } = useContext(AuthContext);
  const reviewCount = product?.reviews?.length || 0;
  const currentUserReview =
    product?.reviews?.find((review) => review.userId === user?.id) || null;
  const averageRating =
    reviewCount > 0
      ? (
          product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviewCount
        ).toFixed(1)
      : "0.0";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getById(id);
        setProduct(response.data);

        const existingReview = response.data.reviews?.find(
          (review) => review.userId === user?.id,
        );
        if (existingReview) {
          setReviewForm({
            rating: existingReview.rating,
            comment: existingReview.comment,
          });
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user?.id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    const success = await addToCart(product.id, quantity);
    setAddingToCart(false);

    if (success) {
      alert("Added to cart!");
      setQuantity(1);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    setReviewMessage("");

    try {
      const response = await productAPI.addReview(product.id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setProduct(response.data);
      setReviewMessage("Your rating and review were saved.");
    } catch (error) {
      setReviewMessage(
        error.response?.data?.error || "Failed to save your review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setDeletingReviewId(reviewId);
    setReviewMessage("");

    try {
      const response = await productAPI.deleteReview(product.id, reviewId);
      setProduct(response.data);
      setReviewMessage("Review deleted successfully.");
    } catch (error) {
      setReviewMessage(
        error.response?.data?.error || "Failed to delete the review.",
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (!product) return <div className="not-found">Product not found</div>;

  return (
    <div className="product-detail">
      <div className="container">
        <button onClick={() => navigate("/")} className="back-btn">
          Back to Games
        </button>

        <div className="product-detail-grid">
          <div className="product-image-large">
            <img src={product.image} alt={product.title} />
          </div>

          <div className="product-details">
            <h1>{product.title}</h1>

            <div className="product-meta">
              <span className="genre-badge">{product.genre}</span>
              <span className="rating-badge">Rating: {averageRating} / 5</span>
            </div>

            {product.developer && (
              <p>
                <strong>Developer:</strong> {product.developer}
              </p>
            )}
            {product.publisher && (
              <p>
                <strong>Publisher:</strong> {product.publisher}
              </p>
            )}
            {product.releaseDate && (
              <p>
                <strong>Release Date:</strong>{" "}
                {new Date(product.releaseDate).toLocaleDateString()}
              </p>
            )}

            <p className="description">{product.description}</p>

            <div className="price-section">
              <span className="price-label">Price</span>
              <span className="price-value">${product.price}</span>
            </div>

            <div className="stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="purchase-section">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="quantity-input"
                />

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="add-to-cart-btn"
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Ratings & Reviews</h2>
            <p>
              Average: {averageRating} / 5 from {reviewCount} review(s)
            </p>
          </div>

          {reviewMessage && (
            <div className="review-message">{reviewMessage}</div>
          )}

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h3>
              {!isAuthenticated
                ? "Log in to review"
                : currentUserReview
                  ? "Edit Your Review"
                  : "Leave Your Review"}
            </h3>
            {isAuthenticated && (
              <p className="review-note">
                Each client can save one review per game. Submitting again will
                update your existing review.
              </p>
            )}

            <div className="review-form-row">
              <label htmlFor="rating">Rating</label>
              <select
                id="rating"
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((current) => ({
                    ...current,
                    rating: parseInt(e.target.value, 10),
                  }))
                }
                disabled={!isAuthenticated}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
            </div>

            <div className="review-form-row">
              <label htmlFor="comment">Your Opinion</label>
              <textarea
                id="comment"
                rows="4"
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((current) => ({
                    ...current,
                    comment: e.target.value,
                  }))
                }
                placeholder="Share your opinion about this game..."
                disabled={!isAuthenticated}
              />
            </div>

            <button
              type="submit"
              className="submit-review-btn"
              disabled={!isAuthenticated || submittingReview}
            >
              {submittingReview ? "Saving..." : "Save Review"}
            </button>
          </form>

          <div className="reviews-list">
            {product.reviews?.length ? (
              product.reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <div>
                      <h3>{review.user?.username || "Customer"}</h3>
                      <p>
                        Rating: {review.rating} / 5 ·{" "}
                        {new Date(review.createdAt).toLocaleDateString()}
                        {new Date(review.updatedAt).getTime() >
                        new Date(review.createdAt).getTime()
                          ? " · Edited"
                          : ""}
                      </p>
                    </div>

                    {user?.role === "admin" && (
                      <button
                        className="delete-review-btn"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingReviewId === review.id}
                      >
                        {deletingReviewId === review.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="no-reviews">No reviews yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
