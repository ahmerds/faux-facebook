interface UserUpdateData {
  firstName: string
  lastName: string
}

export interface UpdateInfoDto {
  uid: string
  data: UserUpdateData
}

export interface ChangePasswordDto {
  uid: string
  oldPassword: string
  newPassword: string
}

export interface ResetPasswordDto {
  email: string
  code: string
  password: string
}

export interface CheckLinkDto {
  email: string
  code: string
}

export interface DisableAccountDto {
  uid: string
  password: string
}
