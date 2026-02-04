import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login screen correctly', () => {
    render(<LoginScreen />);
    
    expect(screen.getByText(/Login/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/email/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/password/i)).toBeTruthy();
  });

  it('updates email input when user types', () => {
    render(<LoginScreen />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.changeText(emailInput, 'test@example.com');
    
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('displays error message on invalid login', async () => {
    // Mock fetch to return error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: 'Invalid credentials' }),
      })
    ) as jest.Mock;

    render(<LoginScreen />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByText(/Login/i);

    fireEvent.changeText(emailInput, 'wrong@example.com');
    fireEvent.changeText(passwordInput, 'wrongpass');
    fireEvent.press(loginButton);

    // Note: Add waitFor for async error display if implemented
  });

  it('navigates to dashboard on successful login', async () => {
    const mockToken = 'fake-jwt-token';
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: mockToken }),
      })
    ) as jest.Mock;

    render(<LoginScreen />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByText(/Login/i);

    fireEvent.changeText(emailInput, 'student@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // Note: Add assertions for navigation and token storage
  });
});
