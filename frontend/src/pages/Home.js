import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../services/api";
import "./Home.css";

const genreOptions = [
  "Action",
  "RPG",
  "Sports",
  "Racing",
  "Adventure",
  "Puzzle",
  "Shooter",
  "Strategy",
];

const getShortDescription = (text, maxLength = 150) => {
  if (!text) {
    return "Power up your library with premium action, unforgettable stories, and next-level multiplayer energy.";
  }

  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, maxLength).trimEnd()}...`;
};

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productAPI.getAll({ genre, search, limit: 24 });
        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [genre, search]);

  const featuredGame = products[0];
  const spotlightGames = products.slice(0, 3);
  const trendingGames = useMemo(() => products.slice(0, 4), [products]);
  const editorPicks = useMemo(() => products.slice(4, 8), [products]);
  const topGenres = useMemo(
    () => [...new Set(products.map((product) => product.genre).filter(Boolean))].slice(0, 5),
    [products],
  );

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-shell">
          <div className="hero-copy">
            <div className="hero-badge">PlayStation Universe</div>
            <h1>One store for the biggest PS4 and PS5 adventures.</h1>
            <p>
              Explore blockbuster exclusives, online favorites, racing icons,
              sports legends, and deep RPG worlds built for every kind of
              PlayStation player.
            </p>

            <div className="hero-actions">
              <a href="#catalog" className="hero-primary-btn">
                Browse the Collection
              </a>
              <a href="#spotlight" className="hero-secondary-btn">
                See Featured Drops
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-card">
                <strong>PS4 + PS5</strong>
                <span>Games for both generations</span>
              </div>
              <div className="hero-stat-card">
                <strong>{products.length || 24} Titles</strong>
                <span>Fresh picks across every genre</span>
              </div>
              <div className="hero-stat-card">
                <strong>Top Rated</strong>
                <span>Fan favorites ready to discover</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-glow" />
            <div className="hero-panel-card">
              {featuredGame?.image && (
                <div className="hero-panel-media">
                  <img src={featuredGame.image} alt={featuredGame.title} />
                </div>
              )}

              <div className="hero-panel-content">
                <span className="hero-panel-label">Featured Spotlight</span>
                <h2>{featuredGame?.title || "Your next PlayStation obsession"}</h2>
                <p>{getShortDescription(featuredGame?.description)}</p>
                <div className="hero-panel-meta">
                  <span>{featuredGame?.genre || "All Genres"}</span>
                  <span>
                    {featuredGame ? `$${featuredGame.price}` : "PS4 & PS5 Ready"}
                  </span>
                </div>
                {featuredGame && (
                  <Link
                    to={`/product/${featuredGame.id}`}
                    className="hero-panel-link"
                  >
                    Open Game Page
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="platform-strip">
        <div className="container platform-strip-inner">
          <div className="platform-copy">
            <span className="platform-kicker">Built for every generation</span>
            <h2>From PS4 legends to PS5 showpieces.</h2>
          </div>
          <div className="platform-badges">
            <span className="platform-badge">PS4 Essentials</span>
            <span className="platform-badge">PS5 Next-Gen Hits</span>
            <span className="platform-badge">Co-op and Competitive</span>
            <span className="platform-badge">Story-Driven Worlds</span>
          </div>
        </div>
      </section>

      <section className="spotlight-section" id="spotlight">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Spotlight Shelf</span>
              <h2>Featured games worth opening first</h2>
            </div>
            <p>
              Fast action, memorable worlds, and high-energy experiences picked
              to grab attention instantly.
            </p>
          </div>

          <div className="spotlight-grid">
            {spotlightGames.map((product, index) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className={`spotlight-card spotlight-card-${index + 1}`}
              >
                <div className="spotlight-overlay" />
                <img src={product.image} alt={product.title} />
                <div className="spotlight-content">
                  <span className="spotlight-tag">{product.genre}</span>
                  <h3>{product.title}</h3>
                  <div className="spotlight-meta">
                    <span>${product.price}</span>
                    <span>{product.rating} rating</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="collections-section">
        <div className="container collections-grid">
          <article className="collection-card">
            <span className="section-kicker">Trending Now</span>
            <h3>Games players are clicking on right now</h3>
            <div className="mini-list">
              {trendingGames.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="mini-game-card"
                >
                  <img src={product.image} alt={product.title} />
                  <div>
                    <strong>{product.title}</strong>
                    <span>{product.genre}</span>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="collection-card collection-card-accent">
            <span className="section-kicker">Why This Store</span>
            <h3>A bigger PlayStation home for PS4 and PS5 fans</h3>
            <ul className="feature-points">
              <li>Browse games across both console generations in one place.</li>
              <li>Search by genre to jump from shooters to story-rich RPGs fast.</li>
              <li>Discover premium picks, rising favorites, and all-time classics.</li>
            </ul>
          </article>

          <article className="collection-card">
            <span className="section-kicker">Genres to Explore</span>
            <h3>Find your next obsession by mood</h3>
            <div className="genre-cloud">
              {(topGenres.length ? topGenres : genreOptions.slice(0, 5)).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={`genre-chip ${genre === item ? "active" : ""}`}
                    onClick={() => setGenre(item === genre ? "" : item)}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Full Catalog</span>
              <h2>Search all PlayStation games</h2>
            </div>
            <p>
              Filter the collection and build your next lineup for PS4 and PS5.
            </p>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search PlayStation games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="genre-select"
            >
              <option value="">All Genres</option>
              {genreOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading games...</div>
          ) : (
            <div className="products-grid">
              {products.length === 0 ? (
                <p className="no-products">
                  No games found. Try a different search.
                </p>
              ) : (
                products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="product-card"
                  >
                    <div className="product-image">
                      <img src={product.image} alt={product.title} />
                    </div>
                    <div className="product-info">
                      <div className="product-platforms">
                        <span>PS4</span>
                        <span>PS5</span>
                      </div>
                      <h3>{product.title}</h3>
                      <p className="game-genre">{product.genre}</p>
                      <div className="product-footer">
                        <span className="price">${product.price}</span>
                        <span className="rating">{product.rating} / 5</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      <section className="editors-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Editor Picks</span>
              <h2>More games to keep the energy high</h2>
            </div>
            <p>One more shelf to keep the homepage feeling alive and full.</p>
          </div>

          <div className="editors-grid">
            {editorPicks.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="editor-card"
              >
                <img src={product.image} alt={product.title} />
                <div className="editor-card-content">
                  <span>{product.genre}</span>
                  <h3>{product.title}</h3>
                  <strong>${product.price}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
