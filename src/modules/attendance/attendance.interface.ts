export type TAttendance = {
    student: string
    status: 'ATTENDED' | 'ABSENT'
    mission: number
    module: number
    moduleVideo: number
}

export type TAbsentFilter = 'today' | 'last2days' | 'last3days'