import httpStatus from 'http-status'
import { catchAsync } from '@/utils/catchAsync'
import { sendResponse } from '@/utils/sendResponse'
import { TaskServices } from './task.service'

const createTask = catchAsync(async (req, res) => {
  const result = await TaskServices.createTaskIntoDatabase(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Task created successfully',
    data: result,
  })
})

const updateTask = catchAsync(async (req, res) => {
  const { taskId } = req.params
  const result = await TaskServices.updateTaskInDatabase(taskId, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task updated successfully',
    data: result,
  })
})

const getCurrentTask = catchAsync(async (req, res) => {
  const result = await TaskServices.getCurrentTaskFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Current task fetched successfully',
    data: result,
  })
})

const getUpcomingTask = catchAsync(async (req, res) => {
  const result = await TaskServices.getUpcomingTaskFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Upcoming task fetched successfully',
    data: result,
  })
})

const getDueTasks = catchAsync(async (req, res) => {
  const result = await TaskServices.getDueTasksFromDatabase()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Due tasks fetched successfully',
    data: result,
  })
})

const deleteTask = catchAsync(async (req, res) => {
  const { taskId } = req.params
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
