import '@testing-library/react-native/extend-expect';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        params: {},
    }),
}));

// Silence the warning about act()
global.console.error = (...args: any[]) => {
    const ignoreMessages = [
        'Warning: ReactDOM.render',
        'Warning: useLayoutEffect',
    ];

    if (typeof args[0] === 'string' && ignoreMessages.some(msg => args[0].includes(msg))) {
        return;
    }

    console.warn(...args);
};
