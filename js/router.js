// Router untuk navigasi antar halaman - FIXED VERSION
const Router = {
    currentPage: 'home',
    currentUniverse: 'all',
    searchQuery: '',
    
    // Initialize router
    init() {
        this.renderPage('home');
        this.setupEventListeners();
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Bottom navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigate(page);
            });
        });
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const universe = e.currentTarget.dataset.universe;
                this.filterByUniverse(universe);
            });
        });
        
        // Search - REALTIME SEARCH
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        searchInput.addEventListener('input', (e) => {
            this.search(e.target.value);
        });
        
        searchBtn.addEventListener('click', () => {
            this.search(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search(searchInput.value);
            }
        });
        
        // Clear search when clicking on universe tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                searchInput.value = '';
                this.searchQuery = '';
            });
        });
    },
    
    // Navigate to page
    navigate(page) {
        this.currentPage = page;
        this.renderPage(page);
        
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === page) {
                btn.classList.add('active');
            }
        });
    },
    
    // Filter by universe
    filterByUniverse(universe) {
        this.currentUniverse = universe;
        this.renderPage('home');
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.universe === universe) {
                btn.classList.add('active');
            }
        });
    },
    
    // Search movies
    search(query) {
        this.searchQuery = query;
        this.currentUniverse = 'all';
        this.renderPage('home');
        
        // Reset tab to "All"
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.universe === 'all') {
                btn.classList.add('active');
            }
        });
    },
    
    // Render page
    async renderPage(page) {
        const content = document.getElementById('content');
        const searchContainer = document.getElementById('search-container');
        const tabNavigation = document.getElementById('tab-navigation');
        
        // Show/hide search and tabs based on page
        if (page === 'home' || page === 'watchlist' || page === 'favorites') {
            searchContainer.style.display = 'flex';
            tabNavigation.style.display = 'flex';
        } else {
            searchContainer.style.display = 'none';
            tabNavigation.style.display = 'none';
        }
        
        // Loading state
        content.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
        
        switch (page) {
            case 'home':
                await this.renderHome();
                break;
            case 'watchlist':
                await this.renderWatchlist();
                break;
            case 'favorites':
                await this.renderFavorites();
                break;
            case 'profile':
                this.renderProfile();
                break;
            case 'about':
                this.renderAbout();
                break;
            default:
                content.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-title">Page Not Found</div></div>';
        }
    },
    
    // Render home page
    async renderHome() {
        const content = document.getElementById('content');
        const movies = await API.getMovies(this.currentUniverse, this.searchQuery);
        
        if (movies.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-film"></i></div>
                    <div class="empty-title">No Movies Found</div>
                    <div class="empty-message">Try adjusting your search or filter</div>
                </div>
            `;
            return;
        }
        
        const moviesHTML = movies.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <div class="movie-actions">
                    <button class="action-btn watchlist-btn ${Storage.isInWatchlist(movie.id) ? 'active' : ''}" data-id="${movie.id}" title="Add to Watchlist">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn favorite-btn ${Storage.isFavorite(movie.id) ? 'active' : ''}" data-id="${movie.id}" title="Add to Favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" loading="lazy">
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-meta">
                        <span class="movie-rating">
                            <i class="fas fa-star star-icon"></i>
                            ${movie.rating}/10
                        </span>
                        <span>${movie.year}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        content.innerHTML = `<div class="movie-grid">${moviesHTML}</div>`;
        
        // Add click listeners
        this.addMovieCardListeners();
    },
    
    // Render watchlist page with checkbox
    async renderWatchlist() {
        const content = document.getElementById('content');
        const watchlistIds = Storage.getWatchlist();
        
        if (watchlistIds.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-list"></i></div>
                    <div class="empty-title">Your Watchlist is Empty</div>
                    <div class="empty-message">Add movies to your watchlist to watch later</div>
                </div>
            `;
            return;
        }
        
        const allMovies = await API.getMovies();
        const watchlistMovies = allMovies.filter(m => watchlistIds.includes(m.id));
        
        if (watchlistMovies.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-list"></i></div>
                    <div class="empty-title">Your Watchlist is Empty</div>
                    <div class="empty-message">Add movies to your watchlist to watch later</div>
                </div>
            `;
            return;
        }
        
        const moviesHTML = watchlistMovies.map(movie => {
            const isWatched = Storage.isWatched(movie.id);
            return `
                <div class="movie-card ${isWatched ? 'watched' : ''}" data-id="${movie.id}">
                    <div class="movie-actions">
                        <button class="action-btn watched-btn ${isWatched ? 'active' : ''}" data-id="${movie.id}" title="Mark as Watched">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn favorite-btn ${Storage.isFavorite(movie.id) ? 'active' : ''}" data-id="${movie.id}" title="Add to Favorites">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    ${isWatched ? '<div class="watched-badge"><i class="fas fa-check-circle"></i> Watched</div>' : ''}
                    <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" loading="lazy">
                    <div class="movie-info">
                        <div class="movie-title">${movie.title}</div>
                        <div class="movie-meta">
                            <span class="movie-rating">
                                <i class="fas fa-star star-icon"></i>
                                ${movie.rating}/10
                            </span>
                            <span>${movie.year}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        content.innerHTML = `<div class="movie-grid">${moviesHTML}</div>`;
        
        // Add click listeners
        this.addWatchlistCardListeners();
    },
    
    // Render favorites page
    async renderFavorites() {
        const content = document.getElementById('content');
        const favoriteIds = Storage.getFavorites();
        
        if (favoriteIds.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-heart"></i></div>
                    <div class="empty-title">No Favorites Yet</div>
                    <div class="empty-message">Mark movies as favorite to see them here</div>
                </div>
            `;
            return;
        }
        
        const allMovies = await API.getMovies();
        const favoriteMovies = allMovies.filter(m => favoriteIds.includes(m.id));
        
        if (favoriteMovies.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-heart"></i></div>
                    <div class="empty-title">No Favorites Yet</div>
                    <div class="empty-message">Mark movies as favorite to see them here</div>
                </div>
            `;
            return;
        }
        
        const moviesHTML = favoriteMovies.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <div class="movie-actions">
                    <button class="action-btn watchlist-btn ${Storage.isInWatchlist(movie.id) ? 'active' : ''}" data-id="${movie.id}" title="Add to Watchlist">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn favorite-btn active" data-id="${movie.id}" title="Remove from Favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" loading="lazy">
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-meta">
                        <span class="movie-rating">
                            <i class="fas fa-star star-icon"></i>
                            ${movie.rating}/10
                        </span>
                        <span>${movie.year}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        content.innerHTML = `<div class="movie-grid">${moviesHTML}</div>`;
        
        // Add click listeners
        this.addMovieCardListeners();
    },
    
    // Render profile page
    renderProfile() {
        const content = document.getElementById('content');
        const profile = ProfileManager.getProfile();
        const stats = ProfileManager.getStats();
        
        // Calculate join duration
        const joinDate = new Date(profile.joinDate);
        const now = new Date();
        const daysSinceJoin = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
        
        content.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-photo-wrapper">
                        <img src="${profile.photoUrl}" alt="Profile Photo" class="profile-photo" id="profile-photo-display">
                        <div class="profile-photo-overlay">
                            <i class="fas fa-camera"></i>
                        </div>
                    </div>
                    <h1 class="profile-username">${profile.username}</h1>
                    <p class="profile-bio">${profile.bio}</p>
                    ${profile.email ? `<p class="profile-email"><i class="fas fa-envelope"></i> ${profile.email}</p>` : ''}
                    <div class="profile-meta">
                        <span><i class="fas fa-calendar"></i> Joined ${daysSinceJoin} days ago</span>
                        <span><i class="fas fa-heart"></i> Favorite: ${profile.favoriteUniverse}</span>
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
        
        // Edit profile button
        document.getElementById('btn-edit-profile').addEventListener('click', () => {
            this.renderEditProfile();
        });
        
        // Reset profile button
        document.getElementById('btn-reset-profile').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your profile to default?')) {
                ProfileManager.resetProfile();
                this.renderProfile();
            }
        });
        
        // Clear all data button
        document.getElementById('btn-clear-data').addEventListener('click', () => {
            if (confirm('⚠️ WARNING: This will delete ALL your data (watchlist, favorites, watched movies). This action cannot be undone!\n\nAre you sure?')) {
                localStorage.clear();
                alert('All data has been cleared!');
                this.renderProfile();
            }
        });
    },
    
    // Render edit profile page
    renderEditProfile() {
        const content = document.getElementById('content');
        const profile = ProfileManager.getProfile();
        
        content.innerHTML = `
            <div class="edit-profile-container">
                <button class="back-btn" id="back-to-profile">
                    <i class="fas fa-arrow-left"></i> Back to Profile
                </button>
                
                <h2 class="edit-profile-title">Edit Profile</h2>
                
                <div class="edit-profile-form">
                    <div class="form-group">
                        <label class="form-label">Profile Photo</label>
                        <div class="photo-upload-section">
                            <img src="${profile.photoUrl}" alt="Profile Photo" class="photo-preview" id="photo-preview">
                            <div class="photo-upload-actions">
                                <input type="file" id="photo-input" accept="image/*" style="display: none;">
                                <button class="btn-upload" id="btn-upload-photo">
                                    <i class="fas fa-upload"></i> Upload Photo
                                </button>
                                <button class="btn-remove" id="btn-remove-photo">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                            <p class="form-hint">Max 5MB, JPG/PNG/GIF</p>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="input-username">Username</label>
                        <input type="text" id="input-username" class="form-input" value="${profile.username}" placeholder="Enter your username" maxlength="30">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="input-bio">Bio</label>
                        <textarea id="input-bio" class="form-textarea" placeholder="Tell us about yourself..." maxlength="150">${profile.bio}</textarea>
                        <p class="form-hint"><span id="bio-count">${profile.bio.length}</span>/150 characters</p>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="input-email">Email (optional)</label>
                        <input type="email" id="input-email" class="form-input" value="${profile.email || ''}" placeholder="your.email@example.com">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="select-universe">Favorite Universe</label>
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
        
        // Character counter for bio
        const bioInput = document.getElementById('input-bio');
        const bioCount = document.getElementById('bio-count');
        bioInput.addEventListener('input', () => {
            bioCount.textContent = bioInput.value.length;
        });
        
        // Photo upload handler
        const photoInput = document.getElementById('photo-input');
        const photoPreview = document.getElementById('photo-preview');
        const btnUpload = document.getElementById('btn-upload-photo');
        const btnRemove = document.getElementById('btn-remove-photo');
        
        btnUpload.addEventListener('click', () => {
            photoInput.click();
        });
        
        photoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    let base64 = await ProfileManager.handleImageUpload(file);
                    // Compress image
                    base64 = await ProfileManager.compressImage(base64);
                    photoPreview.src = base64;
                    alert('✅ Photo uploaded! Don\'t forget to save your changes.');
                } catch (error) {
                    alert('❌ Error: ' + error);
                }
            }
        });
        
        btnRemove.addEventListener('click', () => {
            photoPreview.src = 'images/batman-profile.jpg';
            photoInput.value = '';
        });
        
        // Save profile handler
        document.getElementById('btn-save-profile').addEventListener('click', () => {
            const newProfile = {
                username: document.getElementById('input-username').value.trim() || 'DC Fan',
                bio: document.getElementById('input-bio').value.trim() || 'A passionate DC Universe enthusiast',
                email: document.getElementById('input-email').value.trim(),
                favoriteUniverse: document.getElementById('select-universe').value,
                photoUrl: photoPreview.src,
                joinDate: profile.joinDate
            };
            
            ProfileManager.saveProfile(newProfile);
            alert('✅ Profile saved successfully!');
            this.navigate('profile');
        });
        
        // Cancel button
        document.getElementById('btn-cancel-edit').addEventListener('click', () => {
            this.navigate('profile');
        });
        
        // Back button
        document.getElementById('back-to-profile').addEventListener('click', () => {
            this.navigate('profile');
        });
    },
    
    // Render about page
    renderAbout() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="about-container">
                <img src="images/logo.png" alt="Logo" class="about-logo">
                <h1 class="about-title">MotherBoxVerse</h1>
                <p class="about-subtitle">Your Ultimate DC Universe Movie Catalog</p>
                <p class="about-description">
                    MotherBoxVerse adalah aplikasi katalog film yang didedikasikan untuk semua film dari DC Universe. 
                    Jelajahi film-film dari berbagai timeline DC, mulai dari DCEU, ArrowVerse, hingga DCU terbaru.
                </p>
                <div class="about-features">
                    <div class="feature-item">
                        <div class="feature-icon"><i class="fas fa-film"></i></div>
                        <div class="feature-text">Koleksi lengkap film DC Universe</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon"><i class="fas fa-search"></i></div>
                        <div class="feature-text">Pencarian realtime tanpa tekan enter</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon"><i class="fas fa-heart"></i></div>
                        <div class="feature-text">Simpan film favorit dan watchlist</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="feature-text">Mark as watched untuk tracking progress</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon"><i class="fas fa-tv"></i></div>
                        <div class="feature-text">Support series dengan season & episode</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon"><i class="fas fa-user"></i></div>
                        <div class="feature-text">Customizable profile dengan upload photo</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon"><i class="fas fa-database"></i></div>
                        <div class="feature-text">Powered by Supabase - Real-time Database</div>
                    </div>
                </div>
                <p class="about-description">
                    Dibuat dengan ❤️ untuk para penggemar DC<br>
                    Version 3.0.0 - Profile Edition
                </p>
            </div>
        `;
    },
    
    // Show movie/series detail
    async showDetail(id) {
        const content = document.getElementById('content');
        const searchContainer = document.getElementById('search-container');
        const tabNavigation = document.getElementById('tab-navigation');
        
        searchContainer.style.display = 'none';
        tabNavigation.style.display = 'none';
        
        content.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
        
        const movie = await API.getMovieDetail(id);
        
        if (!movie) {
            content.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-title">Movie Not Found</div></div>';
            return;
        }
        
        const isInWatchlist = Storage.isInWatchlist(movie.id);
        const isFavorite = Storage.isFavorite(movie.id);
        const isWatched = Storage.isWatched(movie.id);
        
        const isSeries = movie.type === 'series' && movie.seasons;
        
        let seasonsHTML = '';
        if (isSeries) {
            seasonsHTML = `
                <div class="detail-section">
                    <h2 class="section-title">Seasons & Episodes</h2>
                    <div class="seasons-container">
                        ${movie.seasons.map((season) => `
                            <div class="season-card">
                                <div class="season-header">
                                    <h3 class="season-title">Season ${season.season}</h3>
                                    <span class="season-episodes">${season.episodes.length} Episodes</span>
                                </div>
                                <div class="episodes-list">
                                    ${season.episodes.map(episode => {
                                        const episodeKey = `${movie.id}-s${season.season}e${episode.episode}`;
                                        const isEpisodeWatched = Storage.isEpisodeWatched(episodeKey);
                                        return `
                                            <div class="episode-item ${isEpisodeWatched ? 'watched' : ''}" data-episode-key="${episodeKey}">
                                                <div class="episode-info">
                                                    <span class="episode-number">E${episode.episode}</span>
                                                    <span class="episode-title">${episode.title}</span>
                                                    <span class="episode-duration">${episode.duration}</span>
                                                </div>
                                                <button class="episode-watched-btn ${isEpisodeWatched ? 'active' : ''}" data-episode-key="${episodeKey}">
                                                    <i class="fas fa-check-circle"></i>
                                                </button>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        content.innerHTML = `
            <div class="detail-container">
                <button class="back-btn" id="btn-back-detail">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <img src="${movie.backdrop}" alt="${movie.title}" class="detail-backdrop" loading="lazy">
                <div class="detail-content">
                    <img src="${movie.poster}" alt="${movie.title}" class="detail-poster" loading="lazy">
                    <div class="detail-info">
                        <h1 class="detail-title">${movie.title}</h1>
                        <div class="detail-type-badge">${isSeries ? 'TV Series' : 'Movie'}</div>
                        <div class="detail-meta">
                            <span><i class="fas fa-star star-icon"></i> ${movie.rating}/10</span>
                            <span><i class="fas fa-calendar"></i> ${movie.year}</span>
                            <span><i class="fas fa-clock"></i> ${movie.duration}</span>
                        </div>
                        <div class="detail-genres">
                            ${movie.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
                        </div>
                        <div class="detail-meta">
                            <span><i class="fas fa-video"></i> ${movie.universe}</span>
                            <span><i class="fas fa-user"></i> ${movie.director}</span>
                        </div>
                        <div class="detail-actions">
                            <button class="detail-btn watchlist-btn ${isInWatchlist ? 'active' : ''}" data-id="${movie.id}">
                                <i class="fas fa-eye"></i>
                                ${isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                            </button>
                            <button class="detail-btn favorite-btn ${isFavorite ? 'active' : ''}" data-id="${movie.id}">
                                <i class="fas fa-heart"></i>
                                ${isFavorite ? 'Favorited' : 'Add to Favorites'}
                            </button>
                            ${!isSeries ? `
                                <button class="detail-btn watched-btn ${isWatched ? 'active' : ''}" data-id="${movie.id}">
                                    <i class="fas fa-check"></i>
                                    ${isWatched ? 'Watched' : 'Mark as Watched'}
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="detail-section">