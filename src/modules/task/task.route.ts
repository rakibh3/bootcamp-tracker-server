import express from 'express'

import {auth, validateRequest} from '@/middlewares'
import {TaskControllers} from '@/modules/task/task.controller'
import {
  createTaskValidationSchema,
  updateTaskValidationSchema,
} from '@/modules/task/task.validation'
import {USER_ROLE} from '@/modules/user/user.constant'

const router = express.Router()

router.post(
  '/task',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  validateRequest(createTaskValidationSchema),
  TaskControllers.createTask,
)

router.patch(
  '/task/:taskId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  validateRequest(updateTaskValidationSchema),
  TaskControllers.updateTask,
)

router.get('/task/current', TaskControllers.getCurrentTask)

router.get('/task/upcoming', TaskControllers.getUpcomingTask)

router.get('/task/due', TaskControllers.getDueTasks)

router.delete(
  '/task/:taskId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  TaskControllers.deleteTask,
)

export const TaskRoute = router
