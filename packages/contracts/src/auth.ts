export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user: UserDTO;
  workspace: DefaultWorkspaceDTO;
  sessionToken: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserDTO;
  defaultWorkspace: DefaultWorkspaceDTO;
  sessionToken: string;
  expiresAt: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DefaultWorkspaceDTO {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmPasswordResetRequest {
  token: string;
  newPassword: string;
}
