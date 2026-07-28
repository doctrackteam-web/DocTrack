import { LoginRequest, ApiResponse, LoginResponse } from '@doctrack/contracts';

export async function submitLogin(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}
