import { RegisterRequest, ApiResponse, RegisterResponse } from '@doctrack/contracts';

export async function submitRegistration(
  payload: RegisterRequest,
): Promise<ApiResponse<RegisterResponse>> {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}
