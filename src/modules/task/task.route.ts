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

router.get(
  '/task/current',
  auth(USER_ROLE.ADMIN, USER_ROLE.STUDENT, USER_ROLE.SRM, USER_ROLE.STUDENT),
  TaskControllers.getCurrentTask,
)

router.get(
  '/task/upcoming',
  auth(USER_ROLE.ADMIN, USER_ROLE.STUDENT, USER_ROLE.SRM, USER_ROLE.STUDENT),
  TaskControllers.getUpcomingTask,
)

router.get(
  '/task/due',
  auth(USER_ROLE.ADMIN, USER_ROLE.STUDENT, USER_ROLE.SRM, USER_ROLE.STUDENT),
  TaskControllers.getDueTasks,
)

router.delete(
  '/task/:taskId',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  TaskControllers.deleteTask,
)

export const TaskRoute = router
