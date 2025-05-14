/**
 * EduStake College Theme System
 * This script extracts colors from college logos and generates dynamic themes
 */

// Main function to extract colors from an image
function extractColorsFromImage(imgElement, callback) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Handler for when image is loaded
    const processImage = () => {
        // Set canvas size to image size
        canvas.width = imgElement.naturalWidth || imgElement.width;
        canvas.height = imgElement.naturalHeight || imgElement.height;
        
        // Draw image to canvas
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        let imageData;
        try {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
            console.error('Error extracting image data:', e);
            // Use fallback colors if extraction fails
            callback(generateFallbackColors());
            return;
        }
        
        // Extract colors
        const colors = analyzeImageColors(imageData.data);
        callback(colors);
    };
    
    // If image is already loaded
    if (imgElement.complete) {
        processImage();
    } else {
        // Wait for image to load
        imgElement.onload = processImage;
    }
}

// Analyze image data to find dominant colors
function analyzeImageColors(data) {
    // Create color buckets to group similar colors
    const colorBuckets = {};
    const bucketSize = 24; // Precision of color buckets
    const skipPixels = 4; // Skip pixels for performance
    
    // Process image data
    for (let i = 0; i < data.length; i += 4 * skipPixels) {
        const r = Math.floor(data[i] / bucketSize) * bucketSize;
        const g = Math.floor(data[i + 1] / bucketSize) * bucketSize;
        const b = Math.floor(data[i + 2] / bucketSize) * bucketSize;
        const a = data[i + 3];
        
        // Skip transparent pixels
        if (a < 125) continue;
        
        // Skip very dark (near black) and very light (near white) colors
        if ((r + g + b) < 60 || (r + g + b) > 720) continue;
        
        const key = `${r},${g},${b}`;
        if (!colorBuckets[key]) {
            colorBuckets[key] = { 
                r, g, b, 
                count: 0 
            };
        }
        colorBuckets[key].count++;
    }
    
    // Sort buckets by count to find most common colors
    const sortedColors = Object.values(colorBuckets).sort((a, b) => b.count - a.count);
    
    // Get primary and secondary colors
    const primaryColor = sortedColors[0] || { r: 88, g: 101, b: 242 }; // Default if no color found
    
    // Find a secondary color that contrasts with the primary
    let secondaryColor = null;
    for (let i = 1; i < sortedColors.length; i++) {
        if (colorDistance(primaryColor, sortedColors[i]) > 100) {
            secondaryColor = sortedColors[i];
            break;
        }
    }
    
    // If no good secondary color found, create one by adjusting primary
    if (!secondaryColor) {
        secondaryColor = {
            r: adjustColorComponent(primaryColor.r, 50),
            g: adjustColorComponent(primaryColor.g, 50),
            b: adjustColorComponent(primaryColor.b, 50)
        };
    }
    
    // Create proper light/dark versions for better readability
    const primaryDark = darkenColor(primaryColor, 0.2);
    const primaryLight = lightenColor(primaryColor, 0.2);
    
    return {
        primary: rgbToHex(primaryColor.r, primaryColor.g, primaryColor.b),
        secondary: rgbToHex(secondaryColor.r, secondaryColor.g, secondaryColor.b),
        primaryDark: rgbToHex(primaryDark.r, primaryDark.g, primaryDark.b),
        primaryLight: rgbToHex(primaryLight.r, primaryLight.g, primaryLight.b),
        textColor: getTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    };
}

// Fallback color generation if extraction fails
function generateFallbackColors() {
    return {
        primary: '#5865F2',
        secondary: '#4A76A8',
        primaryDark: '#4752c4',
        primaryLight: '#6b78f5',
        textColor: '#FFFFFF'
    };
}

// Calculate color distance (for finding contrasting colors)
function colorDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}

// Adjust color component for generating secondary color
function adjustColorComponent(component, amount) {
    return Math.max(0, Math.min(255, component + (component > 127 ? -amount : amount)));
}

// Darken a color by a certain amount
function darkenColor(color, amount) {
    return {
        r: Math.max(0, Math.round(color.r * (1 - amount))),
        g: Math.max(0, Math.round(color.g * (1 - amount))),
        b: Math.max(0, Math.round(color.b * (1 - amount)))
    };
}

// Lighten a color by a certain amount
function lightenColor(color, amount) {
    return {
        r: Math.min(255, Math.round(color.r + (255 - color.r) * amount)),
        g: Math.min(255, Math.round(color.g + (255 - color.g) * amount)),
        b: Math.min(255, Math.round(color.b + (255 - color.b) * amount))
    };
}

// Convert RGB to HEX
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Determine appropriate text color (black or white) based on background
function getTextColor(r, g, b) {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

// Apply theme colors to the dashboard
function applyCollegeTheme(logoImg, collegeName) {
    // Get the channels sidebar element
    const channelsSidebar = document.querySelector('.channels-sidebar');
    const communityHeader = document.querySelector('.community-header');
    
    if (!channelsSidebar || !communityHeader) {
        console.error('Required elements not found');
        return;
    }
    
    // Check if we have a manual override for this college
    if (collegeColorOverrides[collegeName]) {
        const colors = collegeColorOverrides[collegeName];
        
        // Store college theme in localStorage for persistence
        localStorage.setItem(`${collegeName.replace(/\s+/g, '_')}_theme`, JSON.stringify(colors));
        
        // Create a style element for the theme
        let themeStyle = document.getElementById('college-theme-style');
        if (!themeStyle) {
            themeStyle = document.createElement('style');
            themeStyle.id = 'college-theme-style';
            document.head.appendChild(themeStyle);
        }
        
        // Apply the override colors directly
        applyThemeColors(themeStyle, colors, collegeName);
        
        // Add an attribute to the channels sidebar for reference
        channelsSidebar.setAttribute('data-college-theme', collegeName);
        
        console.log(`Applied override theme for ${collegeName}`);
        return;
    }
    
    // No override found, extract colors from the logo
    if (!logoImg) {
        console.error('Logo image not found and no override available');
        return;
    }
    
    // Extract colors from the logo
    extractColorsFromImage(logoImg, (colors) => {
        // Store college theme in localStorage for persistence
        localStorage.setItem(`${collegeName.replace(/\s+/g, '_')}_theme`, JSON.stringify(colors));
        
        // Create a style element for the theme
        let themeStyle = document.getElementById('college-theme-style');
        if (!themeStyle) {
            themeStyle = document.createElement('style');
            themeStyle.id = 'college-theme-style';
            document.head.appendChild(themeStyle);
        }
        
        // Apply the theme colors
        applyThemeColors(themeStyle, colors, collegeName);
        
        // Add an attribute to the channels sidebar for reference
        channelsSidebar.setAttribute('data-college-theme', collegeName);
        
        console.log(`Applied theme for ${collegeName}`);
    });
}

// Manual color overrides for specific colleges
const collegeColorOverrides = {
    'MIT WPU': {
        primary: '#e63946',        // Red color for MIT WPU
        secondary: '#f1faee',
        primaryDark: '#d62828',   // Darker red
        primaryLight: '#f94144',  // Lighter red
        textColor: '#FFFFFF'      // White text for contrast
    }
    // Add more college overrides here if needed
};

// Helper function to apply theme colors
function applyThemeColors(themeStyle, colors, collegeName) {
    // Build the CSS for the theme
    const css = `
        /* Dynamic theme for ${collegeName} */
        .channels-sidebar {
            background-color: ${colors.primaryDark};
        }
        
        .community-header {
            background-color: ${colors.primary};
            color: ${colors.textColor};
            border-bottom: 1px solid ${colors.primaryLight};
        }
        
        .community-header h2 {
            color: ${colors.textColor};
        }
        
        .channel svg,
        .section-header span {
            color: ${colors.textColor}cc; /* Using alpha for slightly muted text */
        }
        
        .channel.active {
            background-color: ${colors.secondary}40; /* Using alpha for transparency */
        }
        
        .channel:hover:not(.active) {
            background-color: ${colors.secondary}20; /* Using alpha for transparency */
        }
        
        .channel.active svg,
        .channel.active span {
            color: ${colors.textColor};
        }
    `;
    
    // Apply the CSS
    themeStyle.textContent = css;
}

// Initialize the theme system
function initCollegeThemeSystem() {
    // Wait for DOM to be loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupThemeSystem);
    } else {
        setupThemeSystem();
    }
    
    function setupThemeSystem() {
        // Get all college items
        const collegeItems = document.querySelectorAll('.college-item');
        
        // Add click event listeners to college items
        collegeItems.forEach(item => {
            item.addEventListener('click', function() {
                const collegeName = this.querySelector('.college-name').textContent;
                const logoImg = this.querySelector('.college-logo');
                
                if (logoImg && collegeName) {
                    applyCollegeTheme(logoImg, collegeName);
                }
            });
        });
        
        // Apply theme for the active college on page load
        const activeCollege = document.querySelector('.college-item.active');
        if (activeCollege) {
            const collegeName = activeCollege.querySelector('.college-name').textContent;
            const logoImg = activeCollege.querySelector('.college-logo');
            
            if (logoImg && collegeName) {
                // Check if we have a cached theme
                const cachedTheme = localStorage.getItem(`${collegeName.replace(/\s+/g, '_')}_theme`);
                
                if (cachedTheme) {
                    // Use cached theme for immediate visual feedback
                    const colors = JSON.parse(cachedTheme);
                    
                    // Create a style element for the theme
                    let themeStyle = document.getElementById('college-theme-style');
                    if (!themeStyle) {
                        themeStyle = document.createElement('style');
                        themeStyle.id = 'college-theme-style';
                        document.head.appendChild(themeStyle);
                    }
                    
                    // Apply the theme colors
                    applyThemeColors(themeStyle, colors, collegeName);
                } else {
                    // No cached theme, generate new one
                    applyCollegeTheme(logoImg, collegeName);
                }
            }
        }
    }
}

// Initialize the theme system
initCollegeThemeSystem(); 