import httpStatus from 'http-status'

import {AppError} from '@/error'
import {TTask} from '@/modules/task/task.interface'
import {Task} from '@/modules/task/task.model'
import {getDhakaTimeRange} from '@/utils'
import {getCache, invalidateCache, setCache} from '@/utils/redisCache'

const TASK_CACHE_TTL = 86400 // 24 hour

/**
 * Creates a new task and enforces one task per due-date day.
 */
const createTaskIntoDatabase = async (payload: TTask) => {
  const taskDate = new Date(payload.dueDate)
  const {startOfDay: targetStartOfDay, endOfDay: targetEndOfDay} = getDhakaTimeRange(taskDate)

  const existingTaskForDay = await Task.findOne({
    dueDate: {
      $gte: targetStartOfDay,
      $lte: targetEndOfDay,
    },
  })

  if (existingTaskForDay) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Only one task can be created per day')
  }

  const result = await Task.create(payload)
  await invalidateCache('cache:task:*')
  return result
}

/**
 * Updates an existing task and validates one task per due-date day.
 */
const updateTaskInDatabase = async (taskId: string, payload: Partial<TTask>) => {
  if (payload.dueDate) {
    const taskDate = new Date(payload.dueDate)
    const {startOfDay: targetStartOfDay, endOfDay: targetEndOfDay} = getDhakaTimeRange(taskDate)

    const existingTaskForDay = await Task.findOne({
      _id: {$ne: taskId},
      dueDate: {
        $gte: targetStartOfDay,
        $lte: targetEndOfDay,
      },
    })

    if (existingTaskForDay) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Only one task can be created per day')
    }
  }

  const result = await Task.findByIdAndUpdate(taskId, payload, {
    new: true,
    runValidators: true,
  })

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task not found')
  }

  await invalidateCache('cache:task:*')
  return result
}

/**
 * Fetches the task assigned for the current calendar day.
 */
const getCurrentTaskFromDatabase = async () => {
  const cached = await getCache('cache:task:current')
  if (cached) return cached

  const {startOfDay, endOfDay} = getDhakaTimeRange()

  const result = await Task.findOne({
    dueDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })

  await setCache('cache:task:current', result, TASK_CACHE_TTL)
  return result
}

/**
 * Retrieves information about the next scheduled task.
 */
const getUpcomingTaskFromDatabase = async () => {
  const cached = await getCache('cache:task:upcoming')
  if (cached) return cached

  const {endOfDay} = getDhakaTimeRange()

  const result = await Task.findOne({
    dueDate: {$gt: endOfDay},
  })

  await setCache('cache:task:upcoming', result, TASK_CACHE_TTL)
  return result
}

/**
 * Lists all tasks that are past their due date.
 */
const getDueTasksFromDatabase = async () => {
  const cached = await getCache('cache:task:due')
  if (cached) return cached

  const {startOfDay} = getDhakaTimeRange()

  const result = await Task.find({
    dueDate: {$lt: startOfDay},
  }).sort({dueDate: -1})

  await setCache('cache:task:due', result, TASK_CACHE_TTL)
  return result
}

/**
 * Deletes a task record from the database.
 */
const deleteTaskFromDatabase = async (taskId: string) => {
  const result = await Task.findByIdAndDelete(taskId)
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task not found')
  }
  await invalidateCache('cache:task:*')
  return result
}

export const TaskServices = {
  createTaskIntoDatabase,
  updateTaskInDatabase,
  getCurrentTaskFromDatabase,
  getUpcomingTaskFromDatabase,
  getDueTasksFromDatabase,
  deleteTaskFromDatabase,
}
