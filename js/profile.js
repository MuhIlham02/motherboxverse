// Profile Management System - COMPLETE VERSION
const ProfileManager = {
    // Get user profile from localStorage
    getProfile() {
        const defaultProfile = {
            username: 'DC Fan',
            bio: 'A passionate DC Universe enthusiast',
            email: '',
            favoriteUniverse: 'DCEU',
            photoUrl: 'images/batman-profile.jpg',
            joinDate: new Date().toISOString()
        };
        
        const stored = localStorage.getItem('userProfile');
        if (stored) {
            try {
                return { ...defaultProfile, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Error parsing profile:', e);
                return defaultProfile;
            }
        }
        
        // Save default profile on first load
        this.saveProfile(defaultProfile);
        return defaultProfile;
    },
    
    // Save profile to localStorage
    saveProfile(profile) {
        try {
            localStorage.setItem('userProfile', JSON.stringify(profile));
            return true;
        } catch (e) {
            console.error('Error saving profile:', e);
            return false;
        }
    },
    
    // Update profile field
    updateProfile(field, value) {
        const profile = this.getProfile();
        profile[field] = value;
        this.saveProfile(profile);
    },
    
    // Get stats (watchlist, favorites, watched counts)
    getStats() {
        // Make sure Storage object exists
        if (typeof Storage === 'undefined') {
            return {
                watchlistCount: 0,
                favoritesCount: 0,
                watchedCount: 0,
                watchedEpisodesCount: 0
            };
        }
        
        return {
            watchlistCount: Storage.getWatchlist().length,
            favoritesCount: Storage.getFavorites().length,
            watchedCount: Storage.getWatched().length,
            watchedEpisodesCount: Storage.getWatchedEpisodes().length
        };
    },
    
    // Upload and convert image to base64
    handleImageUpload(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject('No file selected');
                return;
            }
            
            // Check file type
            if (!file.type.startsWith('image/')) {
                reject('Please select an image file');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                reject('Image size must be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject('Failed to read file');
            };
            
            reader.readAsDataURL(file);
        });
    },
    
    // Compress image
    compressImage(base64, maxWidth = 300, maxHeight = 300) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 (JPEG with 0.8 quality)
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => {
                // If error, return original
                resolve(base64);
            };
            img.src = base64;
        });
    },
    
    // Reset profile to default
    resetProfile() {
        localStorage.removeItem('userProfile');
        return this.getProfile();
    }
};
