/**
 * Format a date string or Date object to a human-readable format
 */
export function formatDate(date, options = {}) {
  const d = new Date(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return d.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
}

/**
 * Format time string (HH:mm) to 12-hour format
 */
export function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get greeting based on time of day
 */
export function getGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const dateSeed = now.getDate();
  let greetingsPool = [];

  if (hour >= 0 && hour < 5) {
    greetingsPool = [
      "Hope you're resting well",
      "Wishing you a peaceful night",
      "Caring for you through the night",
      "Hello"
    ];
  } else if (hour >= 5 && hour < 12) {
    greetingsPool = [
      "Good Morning",
      "Wishing you a bright morning",
      "Hope your day starts beautifully",
      "Hello and welcome"
    ];
  } else if (hour >= 12 && hour < 17) {
    greetingsPool = [
      "Good Afternoon",
      "Hope your afternoon is going well",
      "Wishing you a peaceful afternoon",
      "Hello"
    ];
  } else if (hour >= 17 && hour < 22) {
    greetingsPool = [
      "Good Evening",
      "Hope you're having a relaxing evening",
      "Wishing you a warm, calm evening",
      "Hello and welcome"
    ];
  } else {
    greetingsPool = [
      "Wishing you a peaceful night",
      "Time to wind down",
      "Hope you had a wonderful day",
      "Good Night"
    ];
  }

  // Seed selection with date + hour to keep the greeting stable during re-renders 
  // (preventing text flickering when the digital clock updates every second).
  const index = (dateSeed + hour) % greetingsPool.length;
  return greetingsPool[index];
}

/**
 * Get current day name
 */
export function getCurrentDay() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Get current day short name (Mon, Tue, etc.)
 */
export function getCurrentDayShort() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Mood emoji map
 */
export const moodEmojis = {
  1: { emoji: '😢', label: 'Very Low', color: '#EF5350' },
  2: { emoji: '😟', label: 'Low', color: '#FFA726' },
  3: { emoji: '😐', label: 'Neutral', color: '#FFD54F' },
  4: { emoji: '🙂', label: 'Good', color: '#66BB6A' },
  5: { emoji: '😊', label: 'Excellent', color: '#4CAF50' },
};

/**
 * Category icons map
 */
export const categoryIcons = {
  medication: '💊',
  meal: '🍽️',
  exercise: '🏃',
  hygiene: '🚿',
  other: '📋',
};

/**
 * Truncate text
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Debounce function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
