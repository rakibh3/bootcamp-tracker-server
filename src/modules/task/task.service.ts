import httpStatus from 'http-status'
import AppError from '@/error/AppError'
import { TTask } from './task.interface'
import { Task } from './task.model'
import { getDhakaTimeRange } from '@/utils/dhakaTime.utils'

const createTaskIntoDatabase = async (payload: TTask) => {
  const { startOfDay, endOfDay } = getDhakaTimeRange()
  const taskDate = new Date(payload.dueDate)

  // Check if it's an upcoming task (dueDate > today)
  if (taskDate > endOfDay) {
    const existingUpcomingTask = await Task.findOne({
      dueDate: { $gt: endOfDay },
    })

    if (existingUpcomingTask) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Only one upcoming task can be assigned',
      )
    }
  }

  const result = await Task.create(payload)
  return result
}

const updateTaskInDatabase = async (
  taskId: string,
  payload: Partial<TTask>,
) => {
  const { endOfDay } = getDhakaTimeRange()

  if (payload.dueDate) {
    const taskDate = new Date(payload.dueDate)

    // If updating to an upcoming task, check constraint
    if (taskDate > endOfDay) {
      const existingUpcomingTask = await Task.findOne({
        _id: { $ne: taskId },
        dueDate: { $gt: endOfDay },
      })

      if (existingUpcomingTask) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Only one upcoming task can be assigned',
        )
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

const getCurrentTaskFromDatabase = async () => {
  const { startOfDay, endOfDay } = getDhakaTimeRange()

  const result = await Task.findOne({
    dueDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })

  return result
}

const getUpcomingTaskFromDatabase = async () => {
  const { endOfDay } = getDhakaTimeRange()

  const result = await Task.findOne({
    dueDate: { $gt: endOfDay },
  })

  return result
}

const getDueTasksFromDatabase = async () => {
  const { startOfDay } = getDhakaTimeRange()

  const result = await Task.find({
    dueDate: { $lt: startOfDay },
  }).sort({ dueDate: -1 })

  return result
}

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
