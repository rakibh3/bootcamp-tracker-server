import httpStatus from 'http-status'

import {TaskServices} from '@/modules/task/task.service'
import {catchAsync, sendResponse} from '@/utils'

/**
 * Handles request to create a new educational task
 */
const createTask = catchAsync(async (req, res) => {
  const result = await TaskServices.createTaskIntoDatabase(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Task created successfully',
    data: result,
  })
})

/**
 * Handles request to update an existing task
 */
const updateTask = catchAsync(async (req, res) => {
  const {taskId} = req.params
  const result = await TaskServices.updateTaskInDatabase(taskId, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task updated successfully',
    data: result,
  })
})

/**
 * Handles request to fetch the task assigned for the current day
 */
const getCurrentTask = catchAsync(async (req, res) => {
  const result = await TaskServices.getCurrentTaskFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Current task fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch the next scheduled upcoming task
 */
const getUpcomingTask = catchAsync(async (req, res) => {
  const result = await TaskServices.getUpcomingTaskFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Upcoming task fetched successfully',
    data: result,
  })
})

/**
 * Handles request to list all past due tasks
 */
const getDueTasks = catchAsync(async (req, res) => {
  const result = await TaskServices.getDueTasksFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Due tasks fetched successfully',
    data: result,
  })
})

/**
 * Handles request to delete a task record
 */
const deleteTask = catchAsync(async (req, res) => {
  const {taskId} = req.params
  const result = await TaskServices.deleteTaskFromDatabase(taskId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task deleted successfully',
    data: result,
  })
})

export const TaskControllers = {
  createTask,
  updateTask,
  getCurrentTask,
  getUpcomingTask,
  getDueTasks,
  deleteTask,
}
