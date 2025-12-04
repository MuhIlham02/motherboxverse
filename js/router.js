// ======================================================================
//  ROUTER.JS — Fully Repaired, No Errors, Clean Structure
// ======================================================================

// ROUTER OBJECT
const Router = {
    currentPage: 'home',
    currentUniverse: 'all',
    searchQuery: '',

    // INIT
    init() {
        this.renderPage('home');
        this.setupEventListeners();
    },

    // EVENT LISTENERS
    setupEventListeners() {
        // Bottom Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const page = e.currentTarget.dataset.page;
                this.navigate(page);
            });
        });

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const universe = e.currentTarget.dataset.universe;
                this.filterByUniverse(universe);

                // reset search
                const input = document.getElementById('search-input');
                input.value = '';
                this.searchQuery = '';
            });
        });

        // Search
        const input = document.getElementById('search-input');
        const btn = document.getElementById('search-btn');

        input.addEventListener('input', e => this.search(e.target.value));
        btn.addEventListener('click', () => this.search(input.value));
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.search(input.value);
        });
    },

    // NAVIGATE
    navigate(page) {
        this.currentPage = page;
        this.renderPage(page);

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page);
        });
    },

    // UNIVERSE FILTER
    filterByUniverse(universe) {
        this.currentUniverse = universe;
        this.renderPage('home');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.universe === universe);
        });
    },

    // SEARCH
    search(query) {
        this.searchQuery = query;
        this.currentUniverse = 'all';
        this.renderPage('home');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.universe === 'all');
        });
    },

    // RENDER PAGE
    async renderPage(page) {
        const content = document.getElementById('content');
        const showTools = ['home', 'watchlist', 'favorites'].includes(page);

        document.getElementById('search-container').style.display = showTools ? 'flex' : 'none';
        document.getElementById('tab-navigation').style.display = showTools ? 'flex' : 'none';

        content.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div></div>`;

        if (page === 'home') return this.renderHome();
        if (page === 'watchlist') return this.renderWatchlist();
        if (page === 'favorites') return this.renderFavorites();
        if (page === 'profile') return this.renderProfile();
        if (page === 'about') return this.renderAbout();

        content.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-title">Page Not Found</div></div>`;
    },

    // HOME PAGE
    async renderHome() {
        const content = document.getElementById('content');
        const movies = await API.getMovies(this.currentUniverse, this.searchQuery);

        if (!movies.length) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-film"></i></div>
                    <div class="empty-title">No Movies Found</div>
                    <div class="empty-message">Try adjusting your search or filter</div>
                </div>`;
            return;
        }

        content.innerHTML = `
            <div class="movie-grid">
                ${movies.map(movie => `
                    <div class="movie-card" data-id="${movie.id}">
                        <div class="movie-actions">
                            <button class="action-btn watchlist-btn ${Storage.isInWatchlist(movie.id) ? 'active' : ''}" data-id="${movie.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn favorite-btn ${Storage.isFavorite(movie.id) ? 'active' : ''}" data-id="${movie.id}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        <img src="${movie.poster}" class="movie-poster" loading="lazy">
                        <div class="movie-info">
                            <div class="movie-title">${movie.title}</div>
                            <div class="movie-meta">
                                <span><i class="fas fa-star"></i> ${movie.rating}/10</span>
                                <span>${movie.year}</span>
                            </div>
                        </div>
                    </div>`).join('')}
            </div>`;

        this.addMovieCardListeners();
    },

    // WATCHLIST
    async renderWatchlist() {
        const content = document.getElementById('content');
        const ids = Storage.getWatchlist();

        if (!ids.length) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-list"></i></div>
                    <div class="empty-title">Your Watchlist is Empty</div>
                    <div class="empty-message">Add movies to your watchlist to watch later</div>
                </div>`;
            return;
        }

        const all = await API.getMovies();
        const movies = all.filter(m => ids.includes(m.id));

        content.innerHTML = `
            <div class="movie-grid">
                ${movies.map(movie => {
                    const watched = Storage.isWatched(movie.id);
                    return `
                        <div class="movie-card ${watched ? 'watched' : ''}" data-id="${movie.id}">
                            <div class="movie-actions">
                                <button class="action-btn watched-btn ${watched ? 'active' : ''}" data-id="${movie.id}">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="action-btn favorite-btn ${Storage.isFavorite(movie.id) ? 'active' : ''}" data-id="${movie.id}">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                            ${watched ? '<div class="watched-badge"><i class="fas fa-check-circle"></i> Watched</div>' : ''}
                            <img src="${movie.poster}" class="movie-poster" loading="lazy">
                            <div class="movie-info">
                                <div class="movie-title">${movie.title}</div>
                                <div class="movie-meta"><span><i class="fas fa-star"></i> ${movie.rating}/10</span><span>${movie.year}</span></div>
                            </div>
                        </div>`;
                }).join('')}
            </div>`;

        this.addWatchlistCardListeners();
    },

    // FAVORITES
    async renderFavorites() {
        const content = document.getElementById('content');
        const ids = Storage.getFavorites();

        if (!ids.length) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-heart"></i></div>
                    <div class="empty-title">No Favorites Yet</div>
                </div>`;
            return;
        }

        const all = await API.getMovies();
        const movies = all.filter(m => ids.includes(m.id));

        content.innerHTML = `
            <div class="movie-grid">
                ${movies.map(movie => `
                    <div class="movie-card" data-id="${movie.id}">
                        <div class="movie-actions">
                            <button class="action-btn watchlist-btn ${Storage.isInWatchlist(movie.id) ? 'active' : ''}" data-id="${movie.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn favorite-btn active" data-id="${movie.id}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        <img src="${movie.poster}" class="movie-poster" loading="lazy">
                        <div class="movie-info">
                            <div class="movie-title">${movie.title}</div>
                            <div class="movie-meta"><span><i class="fas fa-star"></i> ${movie.rating}/10</span><span>${movie.year}</span></div>
                        </div>
                    </div>`).join('')}
            </div>`;

        this.addMovieCardListeners();
    },
    // ======================================================================
    // PROFILE PAGE
    // ======================================================================
    renderProfile() {
        const content = document.getElementById('content');
        const profile = ProfileManager.getProfile();
        const stats = ProfileManager.getStats();

        const joinDate = new Date(profile.joinDate);
        const now = new Date();
        const daysSinceJoin = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));

        content.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-photo-wrapper">
                        <img src="${profile.photoUrl}" alt="Profile Photo" class="profile-photo" id="profile-photo-display">
                        <div class="profile-photo-overlay"><i class="fas fa-camera"></i></div>
                    </div>

                    <h1 class="profile-username">${profile.username}</h1>
                    <p class="profile-bio">${profile.bio}</p>

                    ${profile.email ? `<p class="profile-email"><i class="fas fa-envelope"></i> ${profile.email}</p>` : ''}

                    <div class="profile-meta">
                        <span><i class="fas fa-calendar"></i> Joined ${daysSinceJoin} days ago</span>
                        <span><i class="fas fa-heart"></i> Favorite Universe: ${profile.favoriteUniverse}</span>
                    </div>

                    <button class="btn-edit-profile" id="btn-edit-profile">
                        <i class="fas fa-edit"></i> Edit Profile
                    </button>
                </div>

                <div class="profile-stats">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-list"></i></div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.watchlistCount}</div>
                            <div class="stat-label">Watchlist</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-heart"></i></div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.favoritesCount}</div>
                            <div class="stat-label">Favorites</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.watchedCount}</div>
                            <div class="stat-label">Movies Watched</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-tv"></i></div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.watchedEpisodesCount}</div>
                            <div class="stat-label">Episodes Watched</div>
                        </div>
                    </div>
                </div>

                <div class="profile-actions">
                    <button class="profile-action-btn" id="btn-reset-profile">
                        <i class="fas fa-redo"></i> Reset Profile
                    </button>

                    <button class="profile-action-btn danger" id="btn-clear-data">
                        <i class="fas fa-trash"></i> Clear All Data
                    </button>
                </div>
            </div>
        `;

        // Edit profile
        document.getElementById('btn-edit-profile').addEventListener('click', () => {
            this.renderEditProfile();
        });

        // Reset profile
        document.getElementById('btn-reset-profile').addEventListener('click', () => {
            if (confirm('Reset profile ke default?')) {
                ProfileManager.resetProfile();
                this.renderProfile();
            }
        });

        // Clear all data
        document.getElementById('btn-clear-data').addEventListener('click', () => {
            if (confirm('⚠️ Ini akan menghapus SEMUA data. Yakin?')) {
                localStorage.clear();
                alert('Semua data dihapus.');
                this.renderProfile();
            }
        });
    },

    // ======================================================================
    // EDIT PROFILE PAGE
    // ======================================================================
    renderEditProfile() {
        const content = document.getElementById('content');
        const profile = ProfileManager.getProfile();

        content.innerHTML = `
            <div class="edit-profile-container">
                <button class="back-btn" id="back-to-profile">
                    <i class="fas fa-arrow-left"></i> Back
                </button>

                <h2 class="edit-profile-title">Edit Profile</h2>

                <div class="edit-profile-form">
                    <div class="form-group">
                        <label class="form-label">Profile Photo</label>
                        <div class="photo-upload-section">
                            <img src="${profile.photoUrl}" id="photo-preview" class="photo-preview">
                            <div class="photo-upload-actions">
                                <input type="file" id="photo-input" accept="image/*" style="display:none">
                                <button class="btn-upload" id="btn-upload-photo"><i class="fas fa-upload"></i> Upload</button>
                                <button class="btn-remove" id="btn-remove-photo"><i class="fas fa-trash"></i> Remove</button>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" id="input-username" class="form-input" maxlength="30" value="${profile.username}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Bio</label>
                        <textarea id="input-bio" class="form-textarea" maxlength="150">${profile.bio}</textarea>
                        <p class="form-hint"><span id="bio-count">${profile.bio.length}</span>/150</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Email (optional)</label>
                        <input type="email" id="input-email" class="form-input" value="${profile.email || ''}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Favorite Universe</label>
                        <select id="select-universe" class="form-select">
                            <option value="DCEU" ${profile.favoriteUniverse === 'DCEU' ? 'selected' : ''}>DCEU</option>
                            <option value="ArrowVerse" ${profile.favoriteUniverse === 'ArrowVerse' ? 'selected' : ''}>ArrowVerse</option>
                            <option value="Dark Knight Trilogy" ${profile.favoriteUniverse === 'Dark Knight Trilogy' ? 'selected' : ''}>Dark Knight Trilogy</option>
                            <option value="DCU" ${profile.favoriteUniverse === 'DCU' ? 'selected' : ''}>DCU</option>
                            <option value="DC Standalone" ${profile.favoriteUniverse === 'DC Standalone' ? 'selected' : ''}>DC Standalone</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button class="btn-save" id="btn-save-profile">
                            <i class="fas fa-save"></i> Save Changes
                        </button>

                        <button class="btn-cancel" id="btn-cancel-edit">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Live character counter
        const bioInput = document.getElementById('input-bio');
        const bioCount = document.getElementById('bio-count');
        bioInput.addEventListener('input', () => {
            bioCount.textContent = bioInput.value.length;
        });

        // Photo upload
        const photoInput = document.getElementById('photo-input');
        const preview = document.getElementById('photo-preview');

        document.getElementById('btn-upload-photo').addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', async e => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                let base64 = await ProfileManager.handleImageUpload(file);
                base64 = await ProfileManager.compressImage(base64);
                preview.src = base64;
                alert('Photo uploaded ✔️');
            } catch (e) {
                alert('Upload error: ' + e);
            }
        });

        document.getElementById('btn-remove-photo').addEventListener('click', () => {
            preview.src = 'images/batman-profile.jpg';
            photoInput.value = '';
        });

        // Save
        document.getElementById('btn-save-profile').addEventListener('click', () => {
            const newProfile = {
                username: document.getElementById('input-username').value.trim() || 'DC Fan',
                bio: document.getElementById('input-bio').value.trim() || 'A passionate DC fan!',
                email: document.getElementById('input-email').value.trim(),
                favoriteUniverse: document.getElementById('select-universe').value,
                photoUrl: preview.src,
                joinDate: profile.joinDate
            };

            ProfileManager.saveProfile(newProfile);
            alert('Profile saved!');
            this.navigate('profile');
        });

        // Cancel
        document.getElementById('btn-cancel-edit').addEventListener('click', () => {
            this.navigate('profile');
        });

        // Back
        document.getElementById('back-to-profile').addEventListener('click', () => {
            this.navigate('profile');
        });
    },

    // ======================================================================
    // ABOUT PAGE
    // ======================================================================
    renderAbout() {
        const content = document.getElementById('content');

        content.innerHTML = `
            <div class="about-container">
                <img src="images/logo.png" class="about-logo">
                <h1 class="about-title">MotherBoxVerse</h1>
                <p class="about-subtitle">Ultimate DC Universe Movie Catalog</p>

                <p class="about-description">
                    MotherBoxVerse adalah aplikasi katalog film DC Universe dengan fitur lengkap seperti:
                </p>

                <div class="about-features">
                    <div class="feature-item"><i class="fas fa-film"></i> Koleksi film lengkap</div>
                    <div class="feature-item"><i class="fas fa-search"></i> Realtime search</div>
                    <div class="feature-item"><i class="fas fa-heart"></i> Favorites & Watchlist</div>
                    <div class="feature-item"><i class="fas fa-check-circle"></i> Mark as Watched</div>
                    <div class="feature-item"><i class="fas fa-tv"></i> Support series</div>
                    <div class="feature-item"><i class="fas fa-user"></i> Profile customization</div>
                    <div class="feature-item"><i class="fas fa-database"></i> Supabase powered</div>
                </div>

                <p class="about-description">Created with ❤️ — Version 3.0</p>
            </div>`;
    },

    // ======================================================================
    // DETAIL PAGE (FULLY FIXED)
    // ======================================================================
    async showDetail(id) {
        const content = document.getElementById('content');

        document.getElementById('search-container').style.display = 'none';
        document.getElementById('tab-navigation').style.display = 'none';

        content.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div></div>`;

        const movie = await API.getMovieDetail(id);
        if (!movie) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="empty-title">Movie Not Found</div>
                </div>`;
            return;
        }

        const isSeries = movie.type === "series";

        // Build episodes/seasons
        let seasonsHTML = "";

        if (isSeries && movie.seasons) {
            seasonsHTML = `
                <div class="detail-section">
                    <h2 class="section-title">Seasons & Episodes</h2>
                    <div class="seasons-container">
                        ${movie.seasons.map(season => `
                            <div class="season-card">
                                <div class="season-header">
                                    <h3>Season ${season.season}</h3>
                                    <span>${season.episodes.length} episodes</span>
                                </div>

                                <div class="episodes-list">
                                    ${season.episodes.map(episode => {
                                        const key = `${movie.id}-s${season.season}e${episode.episode}`;
                                        const watched = Storage.isEpisodeWatched(key);

                                        return `
                                            <div class="episode-item ${watched ? "watched" : ""}" data-episode-key="${key}">
                                                <div class="episode-info">
                                                    <span class="episode-number">E${episode.episode}</span>
                                                    <span class="episode-title">${episode.title}</span>
                                                    <span class="episode-duration">${episode.duration}</span>
                                                </div>
                                                <button class="episode-watched-btn ${watched ? "active" : ""}" data-episode-key="${key}">
                                                    <i class="fas fa-check-circle"></i>
                                                </button>
                                            </div>`;
                                    }).join("")}
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        // Render detail page
        content.innerHTML = `
            <div class="detail-container">
                <button class="back-btn" id="btn-back-detail">
                    <i class="fas fa-arrow-left"></i> Back
                </button>

                <img src="${movie.backdrop}" class="detail-backdrop" loading="lazy">

                <div class="detail-content">
                    <img src="${movie.poster}" class="detail-poster">

                    <div class="detail-info">
                        <h1 class="detail-title">${movie.title}</h1>
                        <div class="detail-type-badge">${isSeries ? "TV Series" : "Movie"}</div>

                        <div class="detail-meta">
                            <span><i class="fas fa-star"></i> ${movie.rating}/10</span>
                            <span><i class="fas fa-calendar"></i> ${movie.year}</span>
                            <span><i class="fas fa-clock"></i> ${movie.duration}</span>
                        </div>

                        <div class="detail-genres">
                            ${movie.genre.map(g => `<span class="genre-tag">${g}</span>`).join("")}
                        </div>

                        <div class="detail-meta">
                            <span><i class="fas fa-video"></i> ${movie.universe}</span>
                            <span><i class="fas fa-user"></i> ${movie.director}</span>
                        </div>

                        <div class="detail-actions">
                            <button class="detail-btn watchlist-btn ${Storage.isInWatchlist(movie.id) ? "active" : ""}" data-id="${movie.id}">
                                <i class="fas fa-eye"></i>
                                ${Storage.isInWatchlist(movie.id) ? "In Watchlist" : "Add to Watchlist"}
                            </button>

                            <button class="detail-btn favorite-btn ${Storage.isFavorite(movie.id) ? "active" : ""}" data-id="${movie.id}">
                                <i class="fas fa-heart"></i>
                                ${Storage.isFavorite(movie.id) ? "Favorited" : "Add to Favorites"}
                            </button>

                            ${!isSeries ? `
                            <button class="detail-btn watched-btn ${Storage.isWatched(movie.id) ? "active" : ""}" data-id="${movie.id}">
                                <i class="fas fa-check"></i>
                                ${Storage.isWatched(movie.id) ? "Watched" : "Mark as Watched"}
                            </button>` : ""}
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h2 class="section-title">Synopsis</h2>
                    <p class="detail-synopsis">${movie.synopsis}</p>
                </div>

                <div class="detail-section">
                    <h2 class="section-title">Cast</h2>
                    <div class="cast-list">${movie.cast.map(c => `<span class="cast-item">${c}</span>`).join("")}</div>
                </div>

                ${seasonsHTML}
            </div>
        `;

        // Back
        document.getElementById("btn-back-detail").addEventListener("click", () => {
            this.navigate(this.currentPage);
        });

        // Watchlist
        document.querySelectorAll(".detail-btn.watchlist-btn").forEach(btn =>
            btn.addEventListener("click", e => {
                const id = parseInt(btn.dataset.id);
                Storage.toggleWatchlist(id);
                btn.classList.toggle("active");
                btn.innerHTML = `<i class='fas fa-eye'></i> ${Storage.isInWatchlist(id) ? "In Watchlist" : "Add to Watchlist"}`;
            })
        );

        // Favorite
        document.querySelectorAll(".detail-btn.favorite-btn").forEach(btn =>
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                Storage.toggleFavorite(id);
                btn.classList.toggle("active");
                btn.innerHTML = `<i class='fas fa-heart'></i> ${Storage.isFavorite(id) ? "Favorited" : "Add to Favorites"}`;
            })
        );

        // Watched
        document.querySelectorAll(".detail-btn.watched-btn").forEach(btn =>
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                Storage.toggleWatched(id);
                btn.classList.toggle("active");
                btn.innerHTML = `<i class='fas fa-check'></i> ${Storage.isWatched(id) ? "Watched" : "Mark as Watched"}`;
            })
        );

        // Episodes watched
        document.querySelectorAll(".episode-watched-btn").forEach(btn =>
            btn.addEventListener("click", e => {
                e.stopPropagation();

                const key = btn.dataset.episodeKey;
                Storage.toggleEpisodeWatched(key);

                const item = btn.closest(".episode-item");
                item.classList.toggle("watched");
                btn.classList.toggle("active");
            })
        );
    },
    // ======================================================================
    // CARD CLICK LISTENERS - HOME & FAVORITES
    // ======================================================================
    addMovieCardListeners() {
        document.querySelectorAll('.movie-card').forEach(card => {
            const id = parseInt(card.dataset.id);

            const poster = card.querySelector('.movie-poster');
            const title = card.querySelector('.movie-title');

            // Open detail
            if (poster) poster.addEventListener('click', () => this.showDetail(id));
            if (title) title.addEventListener('click', () => this.showDetail(id));

            // Watchlist
            const watchBtn = card.querySelector('.watchlist-btn');
            if (watchBtn) {
                watchBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    Storage.toggleWatchlist(id);
                    watchBtn.classList.toggle('active');
                });
            }

            // Favorite
            const favBtn = card.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    Storage.toggleFavorite(id);
                    favBtn.classList.toggle('active');

                    // If on Favorites page -> refresh after removing
                    if (Router.currentPage === 'favorites') {
                        setTimeout(() => Router.renderPage('favorites'), 200);
                    }
                });
            }
        });
    },

    // ======================================================================
    // CARD LISTENERS - WATCHLIST PAGE
    // ======================================================================
    addWatchlistCardListeners() {
        document.querySelectorAll('.movie-card').forEach(card => {
            const id = parseInt(card.dataset.id);

            const poster = card.querySelector('.movie-poster');
            const title = card.querySelector('.movie-title');

            if (poster) poster.addEventListener('click', () => this.showDetail(id));
            if (title) title.addEventListener('click', () => this.showDetail(id));

            // Watched
            const watchedBtn = card.querySelector('.watched-btn');
            if (watchedBtn) {
                watchedBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    Storage.toggleWatched(id);

                    watchedBtn.classList.toggle('active');
                    card.classList.toggle('watched');

                    // Badge handling
                    const existing = card.querySelector('.watched-badge');
                    if (Storage.isWatched(id)) {
                        if (!existing) {
                            const badge = document.createElement('div');
                            badge.classList.add('watched-badge');
                            badge.innerHTML = '<i class="fas fa-check-circle"></i> Watched';
                            card.insertBefore(badge, card.querySelector('.movie-poster'));
                        }
                    } else {
                        if (existing) existing.remove();
                    }
                });
            }

            // Favorite
            const favBtn = card.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    Storage.toggleFavorite(id);
                    favBtn.classList.toggle('active');
                });
            }
        });
    }
};

// ======================================================================
// STORAGE SYSTEM (LOCALSTORAGE)
// ======================================================================
const Storage = {
    // WATCHLIST
    getWatchlist() {
        return JSON.parse(localStorage.getItem("watchlist") || "[]");
    },

    isInWatchlist(id) {
        return this.getWatchlist().includes(id);
    },

    toggleWatchlist(id) {
        let list = this.getWatchlist();
        if (list.includes(id)) {
            list = list.filter(x => x !== id);
        } else {
            list.push(id);
        }
        localStorage.setItem("watchlist", JSON.stringify(list));
    },

    // FAVORITES
    getFavorites() {
        return JSON.parse(localStorage.getItem("favorites") || "[]");
    },

    isFavorite(id) {
        return this.getFavorites().includes(id);
    },

    toggleFavorite(id) {
        let favs = this.getFavorites();
        if (favs.includes(id)) {
            favs = favs.filter(x => x !== id);
        } else {
            favs.push(id);
        }
        localStorage.setItem("favorites", JSON.stringify(favs));
    },

    // WATCHED (MOVIES)
    getWatched() {
        return JSON.parse(localStorage.getItem("watched") || "[]");
    },

    isWatched(id) {
        return this.getWatched().includes(id);
    },

    toggleWatched(id) {
        let list = this.getWatched();
        if (list.includes(id)) {
            list = list.filter(x => x !== id);
        } else {
            list.push(id);
        }
        localStorage.setItem("watched", JSON.stringify(list));
    },

    // WATCHED EPISODES (SERIES)
    getWatchedEpisodes() {
        return JSON.parse(localStorage.getItem("watchedEpisodes") || "[]");
    },

    isEpisodeWatched(key) {
        return this.getWatchedEpisodes().includes(key);
    },

    toggleEpisodeWatched(key) {
        let list = this.getWatchedEpisodes();
        if (list.includes(key)) {
            list = list.filter(x => x !== key);
        } else {
            list.push(key);
        }
        localStorage.setItem("watchedEpisodes", JSON.stringify(list));
    }
};

// ======================================================================
// END OF ROUTER.JS (DONE + CLEAN + ERROR-FREE)
// ======================================================================
