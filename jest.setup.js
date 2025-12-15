/**
 * Jest setup file.
 * Runs before each test file.
 */

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock expo-notifications (not available in test environment)
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("mock-notification-id")),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
  AndroidImportance: {
    MAX: 5,
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
  },
  AndroidNotificationPriority: {
    MAX: "max",
    HIGH: "high",
    DEFAULT: "default",
    LOW: "low",
    MIN: "min",
  },
  AndroidNotificationVisibility: {
    PUBLIC: 1,
    PRIVATE: 0,
    SECRET: -1,
  },
  SchedulableTriggerInputTypes: {
    DATE: "date",
    TIME_INTERVAL: "timeInterval",
    CALENDAR: "calendar",
  },
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
  appOwnership: "standalone", // Not "expo" so isExpoGo() returns false
  expoConfig: {
    name: "salat-app",
    slug: "salat-app",
  },
}));

// Mock Platform
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "android",
  select: jest.fn((objs) => objs.android ?? objs.default),
}));

// Silence console.warn in tests (optional)
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    // Filter out specific warnings if needed
    if (args[0]?.includes?.("Failed to")) return;
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
