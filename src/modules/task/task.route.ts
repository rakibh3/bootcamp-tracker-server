import express from 'express'
import { validateRequest } from '@/middlewares/validateRequest'
import {
  createTaskValidationSchema,
  updateTaskValidationSchema,
} from './task.validation'
import { TaskControllers } from './task.controller'
import auth from '@/middlewares/auth'
import { USER_ROLE } from '../user/user.constant'

const router = express.Router()

router.post(
  '/task',
  // auth(USER_ROLE.ADMIN),
  validateRequest(createTaskValidationSchema),
  TaskControllers.createTask,
)

router.patch(
  '/task/:taskId',
  // auth(USER_ROLE.ADMIN),
  validateRequest(updateTaskValidationSchema),
  TaskControllers.updateTask,
)

router.get(
  '/task/current',
  // auth(USER_ROLE.ADMIN, USER_ROLE.STUDENT),
  TaskControllers.getCurrentTask,
)

router.get(
  '/task/upcoming',
  // auth(USER_ROLE.ADMIN, USER_ROLE.STUDENT),
  TaskControllers.getUpcomingTask,
)

router.get(
  '/task/due',
  // auth(USER_ROLE.ADMIN, USER_ROLE.STUDENT),
  TaskControllers.getDueTasks,
)

router.delete(
  '/task/:taskId',
  // auth(USER_ROLE.ADMIN),
  TaskControllers.deleteTask,
)

export const TaskRoute = router
