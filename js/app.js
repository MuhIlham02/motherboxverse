// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// Initialize Particles.js
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#00ffff'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00ffff',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
        console.log('✨ Particles.js initialized');
    } else {
        console.warn('⚠️ Particles.js not loaded');
    }
}

// Typewriter effect for splash screen
function typeWriter(text, element, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Loading progress animation
function animateLoadingBar() {
    const progressBar = document.getElementById('loading-progress');
    const percentText = document.getElementById('loading-percent');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        
        if (progressBar && percentText) {
            progressBar.style.width = progress + '%';
            percentText.textContent = Math.floor(progress) + '%';
        }
    }, 100);
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles background
    initParticles();
    
    console.log('🚀 Initializing MotherBoxVerse...');
    console.log('📡 Supabase URL:', SUPABASE_CONFIG.url);
    
    // Start typewriter effect
    const typewriterElement = document.getElementById('typewriter-text');
    if (typewriterElement) {
        setTimeout(() => {
            typeWriter('MotherBoxVerse', typewriterElement, 150);
        }, 800);
    }
    
    // Start loading bar animation
    setTimeout(() => {
        animateLoadingBar();
    }, 1500);
    
    // Hide splash screen after animation completes
    setTimeout(() => {
        const splashScreen = document.getElementById('splash-screen');
        const app = document.getElementById('app');
        
        if (splashScreen && app) {
            // Start fade out
            splashScreen.style.animation = 'splashFadeOut 0.8s ease forwards';
            
            // After fade out completes, hide splash and show app
            setTimeout(() => {
                splashScreen.style.display = 'none';
                app.style.display = 'block';
                
                // Add entrance animation for app
                app.style.animation = 'fadeIn 0.5s ease forwards';
                
                // Initialize router
                Router.init();
                
                console.log('✅ App initialized successfully!');
            }, 800);
        }
    }, 3500);
});

// Add fadeIn animation for app entrance
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Install prompt for PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    console.log('💾 PWA install prompt available');
});

window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    deferredPrompt = null;
});

// Optional: Function to trigger install prompt
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
            } else {
                console.log('❌ User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
}
