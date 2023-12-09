import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import RegistrationForm from './RegistrationForm'; // Replace with the actual component import

// Mock an API function for user registration
const mockRegisterUser = jest.fn();

// Mock a successful registration response
mockRegisterUser.mockResolvedValue({
  status: 201,
  message: 'User registered successfully.',
});

test('User can successfully register with valid data', async () => {
  // Render the registration form component
  render(<RegistrationForm registerUser={mockRegisterUser} />);

  // Fill out the registration form with valid data
  const usernameInput = screen.getByLabelText('Username');
  const emailInput = screen.getByLabelText('Email');
  const passwordInput = screen.getByLabelText('Password');
  const submitButton = screen.getByText('Register');

  fireEvent.change(usernameInput, { target: { value: 'testuser' } });
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });

  fireEvent.click(submitButton);

  // Wait for the registration process to complete
  await waitFor(() => {
    // Check if the registration was successful
    expect(mockRegisterUser).toHaveBeenCalledTimes(1);
    expect(mockRegisterUser).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    // Check if a success message is displayed to the user
    const successMessage = screen.getByText('User registered successfully.');
    expect(successMessage).toBeInTheDocument();
  });
});

