export interface TokenData {
  email: string
  uid: string 
  lastName: string
  firstName: string
  lastLogin: string
}

export interface RegisterDto {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface ConfirmEmailDto {
  email: string
  c: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RefreshTokenDto {
  uid: string
  refreshToken: string
}
