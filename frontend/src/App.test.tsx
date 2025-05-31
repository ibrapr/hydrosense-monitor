import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch globally
global.fetch = jest.fn();

describe('HydroSense Monitor App', () => {
  beforeEach(() => {
    // Clear mock before each test
    (global.fetch as jest.Mock).mockClear();
  });

  test('renders main components', () => {
    render(<App />);
    expect(screen.getByText('HydroSense Monitor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Unit ID')).toBeInTheDocument();
    expect(screen.getByText('Show All Readings')).toBeInTheDocument();
    expect(screen.getByText('Show Alerts Only')).toBeInTheDocument();
    expect(screen.getByText('Send Random Reading')).toBeInTheDocument();
  });

  test('sends random reading', async () => {
    // Mock both API calls
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => // First call - POST sensor reading
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'OK', classification: 'Healthy' })
        })
      )
      .mockImplementationOnce(() => // Second call - GET readings
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            alerts: [{
              timestamp: '2025-05-24T12:34:56Z',
              readings: { pH: 6.5, temp: 22.1, ec: 1.2 },
              classification: 'Healthy'
            }]
          })
        })
      );

    render(<App />);
    
    // Enter unit ID
    const input = screen.getByPlaceholderText('Enter Unit ID');
    fireEvent.change(input, { target: { value: 'test-unit' } });

    // Click send button
    const sendButton = screen.getByText('Send Random Reading');
    fireEvent.click(sendButton);

    // Verify fetch was called twice
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Verify the POST request
    expect((global.fetch as jest.Mock).mock.calls[0][1]).toHaveProperty('method', 'POST');
  });

  test('shows alerts', async () => {
    // Mock alerts response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          alerts: [{
            timestamp: '2025-05-24T12:34:56Z',
            readings: { pH: 4.5, temp: 22.1, ec: 1.2 },
            classification: 'Needs Attention'
          }]
        })
      })
    );

    render(<App />);
    
    // Enter unit ID
    const input = screen.getByPlaceholderText('Enter Unit ID');
    fireEvent.change(input, { target: { value: 'test-unit' } });

    // Click alerts button
    const alertsButton = screen.getByText('Show Alerts Only');
    fireEvent.click(alertsButton);

    // Verify fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
}); 