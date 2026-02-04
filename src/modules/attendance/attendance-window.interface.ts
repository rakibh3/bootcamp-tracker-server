export type TAttendanceWindow = {
  isOpen: boolean
  verificationCode?: string
  openedBy?: string
  openedAt?: Date
  closedAt?: Date
}
