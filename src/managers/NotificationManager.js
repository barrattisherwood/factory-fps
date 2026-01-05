/**
 * NotificationManager - Centralized notification system
 * Displays all game notifications in a consistent area (left side under health bar)
 */
export class NotificationManager {
  constructor() {
    this.container = null;
    this.init();
  }
  
  init() {
    // Create notification container
    this.container = document.createElement('div');
    this.container.id = 'game-notifications';
    document.body.appendChild(this.container);
  }
  
  /**
   * Show a notification
   * @param {string} text - Message to display
   * @param {string} type - Type: 'pickup', 'info', 'warning', 'success', 'error'
   * @param {Object} options - Additional options (color, icon, duration)
   */
  show(text, type = 'info', options = {}) {
    const notification = document.createElement('div');
    notification.className = `game-notification notification-${type}`;
    
    const {
      color = null,
      icon = null,
      duration = 3000
    } = options;
    
    // Build notification content
    let content = '';
    
    if (icon) {
      content += `<span class="notification-icon">${icon}</span>`;
    }
    
    content += `<span class="notification-text">${text}</span>`;
    
    notification.innerHTML = content;
    
    // Apply custom color if provided
    if (color) {
      notification.style.borderColor = color;
    }
    
    // Add to container
    this.container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
    
    return notification;
  }
  
  /**
   * Show a pickup notification (resource/ammo collected)
   */
  showPickup(resourceType, amount, config) {
    // Get resource color from config
    const color = config ? `#${config.color.toString(16).padStart(6, '0')}` : '#ffffff';
    
    // Format resource name
    const resourceName = resourceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const text = `<span style="color: ${color}; font-size: 20px; font-weight: bold;">+${amount}</span> ${resourceName}`;
    
    this.show(text, 'pickup', { color, duration: 2000 });
  }
  
  /**
   * Show an info message
   */
  showInfo(text, duration = 3000) {
    this.show(text, 'info', { duration });
  }
  
  /**
   * Show a warning message
   */
  showWarning(text, duration = 3000) {
    this.show(text, 'warning', { duration, color: '#ff9900' });
  }
  
  /**
   * Show a success message
   */
  showSuccess(text, duration = 3000) {
    this.show(text, 'success', { duration, color: '#00ff00' });
  }
  
  /**
   * Show an error message
   */
  showError(text, duration = 3000) {
    this.show(text, 'error', { duration, color: '#ff0000' });
  }
  
  /**
   * Clear all notifications
   */
  clearAll() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
