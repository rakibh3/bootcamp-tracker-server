import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

const DHAKA_TIMEZONE = 'Asia/Dhaka'

/**
 * Get current time in Dhaka timezone (UTC+6)
 * @returns Date object representing current Dhaka time
 */
export const getDhakaTime = (): Date => {
  return dayjs().tz(DHAKA_TIMEZONE).toDate()
}

/**
 * Get start and end of day range for Dhaka timezone
 * @param targetDate Optional date to get range for (defaults to current Dhaka time)
 * @returns Object containing startOfDay and endOfDay Date objects
 */
export const getDhakaTimeRange = (targetDate?: Date | string | number) => {
  const dhakaTime = dayjs(targetDate || new Date()).tz(DHAKA_TIMEZONE)

  const startOfDay = dhakaTime.startOf('day').toDate()
  const endOfDay = dhakaTime.endOf('day').toDate()

  return {
    startOfDay,
    endOfDay,
    dhakaTime: dhakaTime.toDate(),
  }
}
