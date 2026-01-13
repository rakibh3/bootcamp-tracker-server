/**
 * Get current time in Dhaka timezone (UTC+6)
 * @returns Date object representing current Dhaka time
 */
export const getDhakaTime = (): Date => {
    const now = new Date()
    const dhakaOffset = 6 * 60 // Dhaka is UTC+6 in minutes
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
    const dhakaTime = new Date(utcTime + (dhakaOffset * 60000))
    
    return dhakaTime
}

/**
 * Get start and end of day range for Dhaka timezone
 * @param targetDate Optional date to get range for (defaults to current Dhaka time)
 * @returns Object containing startOfDay and endOfDay Date objects
 */
export const getDhakaTimeRange = (targetDate?: Date) => {
    const dhakaTime = targetDate ? new Date(targetDate) : getDhakaTime()
    
    const startOfDay = new Date(
        dhakaTime.getFullYear(), 
        dhakaTime.getMonth(), 
        dhakaTime.getDate(), 
        0, 0, 0, 0
    )
    
    const endOfDay = new Date(
        dhakaTime.getFullYear(), 
        dhakaTime.getMonth(), 
        dhakaTime.getDate(), 
        23, 59, 59, 999
    )

    return { startOfDay, endOfDay, dhakaTime }
}
