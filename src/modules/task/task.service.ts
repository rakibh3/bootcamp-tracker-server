import httpStatus from 'http-status'

import {AppError} from '@/error'
import {TTask} from '@/modules/task/task.interface'
import {Task} from '@/modules/task/task.model'
import {getDhakaTimeRange} from '@/utils'

/**
 * Creates a new task and enforces a single upcoming task policy.
 */
const createTaskIntoDatabase = async (payload: TTask) => {
  const {endOfDay} = getDhakaTimeRange()
  const taskDate = new Date(payload.dueDate)

  if (taskDate > endOfDay) {
    const existingUpcomingTask = await Task.findOne({
      dueDate: {$gt: endOfDay},
    })

    if (existingUpcomingTask) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Only one upcoming task can be assigned')
    }
  }

  const result = await Task.create(payload)
  return result
}

/**
 * Updates an existing task and validates upcoming task constraints.
 */
const updateTaskInDatabase = async (taskId: string, payload: Partial<TTask>) => {
  const {endOfDay} = getDhakaTimeRange()

  if (payload.dueDate) {
    const taskDate = new Date(payload.dueDate)

    if (taskDate > endOfDay) {
      const existingUpcomingTask = await Task.findOne({
        _id: {$ne: taskId},
        dueDate: {$gt: endOfDay},
      })

      if (existingUpcomingTask) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Only one upcoming task can be assigned')
      }
    }
  }

  const result = await Task.findByIdAndUpdate(taskId, payload, {
    new: true,
    runValidators: true,
  })

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task not found')
  }

  return result
}

/**
 * Fetches the task assigned for the current calendar day.
 */
const getCurrentTaskFromDatabase = async () => {
  const {startOfDay, endOfDay} = getDhakaTimeRange()

  const result = await Task.findOne({
    dueDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })

  return result
}

/**
 * Retrieves information about the next scheduled task.
 */
const getUpcomingTaskFromDatabase = async () => {
  const {endOfDay} = getDhakaTimeRange()

  const result = await Task.findOne({
    dueDate: {$gt: endOfDay},
  })

  return result
}

/**
 * Lists all tasks that are past their due date.
 */
const getDueTasksFromDatabase = async () => {
  const {startOfDay} = getDhakaTimeRange()

  const result = await Task.find({
    dueDate: {$lt: startOfDay},
  }).sort({dueDate: -1})

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
