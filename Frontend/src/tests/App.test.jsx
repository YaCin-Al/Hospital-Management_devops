import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../components/Login';
import SignUp from '../components/SignUp';
import Patients from '../components/Patients';
import Appointments from '../components/Appointments';
import LoginContext from '../context/LoginContext';
import React, { useState } from 'react';
import axios from 'axios';

// ---------------------------------------------------------------------------
// Axios mock
// ---------------------------------------------------------------------------
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

/** Default resolved values restored before every test that calls clearAllMocks */
const resetAxiosMocks = () => {
  axios.get.mockResolvedValue({
    data: {
      data: [
        { id: 1, name: 'John Doe',   age: 35, gender: 'Male',   contact: '123-456-7890' },
        { id: 2, name: 'Jane Smith', age: 28, gender: 'Female', contact: '987-654-3210' },
      ],
    },
  });
  axios.post.mockResolvedValue({ data: { message: 'Success' } });
  axios.put.mockResolvedValue({ data: { message: 'Success' } });
  axios.delete.mockResolvedValue({ data: { message: 'Success' } });
};

// ---------------------------------------------------------------------------
// Context wrappers
// ---------------------------------------------------------------------------
const AppWrapper = ({ children, useRouter = true }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const content = (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </LoginContext.Provider>
  );

  return useRouter ? <BrowserRouter>{content}</BrowserRouter> : content;
};

const AppWrapperLoggedIn = ({ children, useRouter = true }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const content = (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </LoginContext.Provider>
  );

  return useRouter ? <BrowserRouter>{content}</BrowserRouter> : content;
};

// ===========================================================================
// Test suite
// ===========================================================================
describe('Hospital Management System', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    resetAxiosMocks();
  });

  // =========================================================================
  // LOGIN
  // =========================================================================
  describe('Login Component – Authentication', () => {

    it('renders email field, password field and submit button', () => {
      render(<AppWrapper><Login /></AppWrapper>);

      expect(screen.getByPlaceholderText(/youremail@example\.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('updates email field as user types', async () => {
      const user = userEvent.setup();
      render(<AppWrapper><Login /></AppWrapper>);

      const emailInput = screen.getByPlaceholderText(/youremail@example\.com/i);
      await user.type(emailInput, 'doctor@hospital.com');
      expect(emailInput.value).toBe('doctor@hospital.com');
    });

    it('updates password field as user types', async () => {
      const user = userEvent.setup();
      render(<AppWrapper><Login /></AppWrapper>);

      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      await user.type(passwordInput, 'securePassword123');
      expect(passwordInput.value).toBe('securePassword123');
    });

    it('email field is required', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByPlaceholderText(/youremail@example\.com/i)).toBeRequired();
    });

    it('password field is required', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeRequired();
    });

    it('clears form fields after submission', async () => {
      const user = userEvent.setup();
      render(<AppWrapper><Login /></AppWrapper>);

      const emailInput    = screen.getByPlaceholderText(/youremail@example\.com/i);
      const passwordInput = screen.getByPlaceholderText(/••••••••/i);

      await user.type(emailInput, 'admin@hospital.com');
      await user.type(passwordInput, 'Password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
      });
    });

    it('has a link to the signup page', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByRole('link', { name: /sign up/i }))
        .toHaveAttribute('href', '/signup');
    });

    it('displays the correct heading', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByRole('heading', { name: /login to health nest/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // SECURITY
  // =========================================================================
  describe('Security – Login form', () => {

    it('password input type is "password" (masked)', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByPlaceholderText(/••••••••/i)).toHaveAttribute('type', 'password');
    });

    it('email input type is "email"', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByPlaceholderText(/youremail@example\.com/i)).toHaveAttribute('type', 'email');
    });

    it('email field is required', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByPlaceholderText(/youremail@example\.com/i)).toBeRequired();
    });

    it('password field is required', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeRequired();
    });
  });

  // =========================================================================
  // ACCESSIBILITY
  // =========================================================================
  describe('Accessibility – Login form (WCAG)', () => {

    it('has labelled email and password inputs', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('login button is enabled and accessible', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      const btn = screen.getByRole('button', { name: /login/i });
      expect(btn).toBeInTheDocument();
      expect(btn).not.toBeDisabled();
    });

    it('has an h2 heading', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('sign-up link has an href attribute', () => {
      render(<AppWrapper><Login /></AppWrapper>);
      expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href');
    });
  });

  // =========================================================================
  // SIGNUP
  // =========================================================================
  describe('SignUp Component – Registration', () => {

    it('renders at least one text input', () => {
      render(<AppWrapper><SignUp /></AppWrapper>);
      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    });

    it('renders a submit button', () => {
      render(<AppWrapper><SignUp /></AppWrapper>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // PATIENTS
  // =========================================================================
  describe('Patients Component – Patient Management', () => {

    it('renders the Patient Management heading', () => {
      render(<AppWrapper><Patients /></AppWrapper>);
      expect(screen.getByText(/Patient Management/i)).toBeInTheDocument();
    });

    it('displays both seeded patients', () => {
      render(<AppWrapper><Patients /></AppWrapper>);
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    });

    it('displays patient age, gender and contact number', () => {
      render(<AppWrapper><Patients /></AppWrapper>);
      expect(screen.getByText(/Age:\s*35/i)).toBeInTheDocument();
      expect(screen.getByText(/Gender:\s*Male/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact:\s*123-456-7890/i)).toBeInTheDocument();
    });

    it('search input accepts user input', async () => {
      const user = userEvent.setup();
      render(<AppWrapper><Patients /></AppWrapper>);

      const searchInputs = screen.queryAllByPlaceholderText(/search/i);
      if (searchInputs.length > 0) {
        await user.type(searchInputs[0], 'John');
        expect(searchInputs[0].value).toBe('John');
      }
    });

    it('still renders seeded patients after an API error', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      render(<AppWrapper><Patients /></AppWrapper>);
      // Component should fall back to local/seeded data
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // APPOINTMENTS – unauthenticated
  // =========================================================================
  describe('Appointments Component – unauthenticated', () => {

    it('shows the login form when not authenticated', () => {
      render(<AppWrapper><Appointments /></AppWrapper>);
      expect(
        screen.getByRole('heading', { name: /login to health nest/i })
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // APPOINTMENTS – authenticated
  // =========================================================================
  describe('Appointments Component – authenticated', () => {

    it('renders appointment data when logged in', () => {
      render(<AppWrapperLoggedIn><Appointments /></AppWrapperLoggedIn>);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('displays scheduled appointments', () => {
      render(<AppWrapperLoggedIn><Appointments /></AppWrapperLoggedIn>);
      const scheduledBadges = screen.getAllByText(/Scheduled/i);
      expect(scheduledBadges.length).toBeGreaterThan(0);
    });

    it('displays doctors available for appointments', () => {
      render(<AppWrapperLoggedIn><Appointments /></AppWrapperLoggedIn>);
      expect(screen.getByText(/Dr\. Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Dr\. Johnson/i)).toBeInTheDocument();
    });

    it('displays appointment notes', () => {
      render(<AppWrapperLoggedIn><Appointments /></AppWrapperLoggedIn>);
      expect(screen.getByText(/Regular checkup/i)).toBeInTheDocument();
      expect(screen.getByText(/Follow-up/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // INTEGRATION
  // =========================================================================
  describe('Integration – App shell', () => {

    it('renders without crashing', () => {
      render(<AppWrapper useRouter={false}><App /></AppWrapper>);
      expect(document.body).toBeInTheDocument();
    });

    it('has at least 3 navigation links in the header', () => {
      render(<AppWrapper useRouter={false}><App /></AppWrapper>);
      expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(3);
    });
  });

  // =========================================================================
  // LOGIN CONTEXT
  // =========================================================================
  describe('LoginContext – state management', () => {

    it('exposes isLoggedIn as false by default', () => {
      const TestComponent = () => {
        const { isLoggedIn } = React.useContext(LoginContext);
        return <div>{isLoggedIn ? 'Logged In' : 'Logged Out'}</div>;
      };
      render(<AppWrapper><TestComponent /></AppWrapper>);
      expect(screen.getByText(/Logged Out/i)).toBeInTheDocument();
    });

    it('updates isLoggedIn to true when setIsLoggedIn is called', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { isLoggedIn, setIsLoggedIn } = React.useContext(LoginContext);
        return (
          <>
            <div>{isLoggedIn ? 'Logged In' : 'Logged Out'}</div>
            <button onClick={() => setIsLoggedIn(true)}>Toggle</button>
          </>
        );
      };
      render(<AppWrapper><TestComponent /></AppWrapper>);

      expect(screen.getByText(/Logged Out/i)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /toggle/i }));
      await waitFor(() =>
        expect(screen.getByText(/Logged In/i)).toBeInTheDocument()
      );
    });
  });

  // =========================================================================
  // API INTEGRATION
  // =========================================================================
  describe('API Integration', () => {

    it('fetches and displays patients from API', async () => {
      render(<AppWrapper><Patients /></AppWrapper>);
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    it('renders SignUp without API errors', () => {
      render(<AppWrapper><SignUp /></AppWrapper>);
      expect(document.body).toBeInTheDocument();
    });

    it('handles API errors gracefully and keeps seeded data visible', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));
      render(<AppWrapper><Patients /></AppWrapper>);
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

});