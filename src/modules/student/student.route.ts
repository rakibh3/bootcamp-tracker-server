import express from 'express'

import {auth, validateRequest} from '@/middlewares'
import {StudentControllers} from '@/modules/student/student.controller'
import {
  createStudentValidationSchema,
  updateStudentValidationSchema,
} from '@/modules/student/student.validation'
import {USER_ROLE} from '@/modules/user/user.constant'

const router = express.Router()

// Route to create a new student
router.post(
  '/students',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  validateRequest(createStudentValidationSchema),
  StudentControllers.createStudent,
)

// Route to get all students
router.get(
  '/students',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.SRM),
  StudentControllers.getAllStudents,
)

// Route to assign students to SRM
router.patch(
  '/students/assign-srm',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  StudentControllers.assignStudentsToSRM,
)

// Route to get student by ID
router.get(
  '/students/:studentId',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.SRM),
  StudentControllers.getStudentById,
)

// Route to get student by user ID
router.get('/students/user/:userId', StudentControllers.getStudentByUserId)

// Route to update student
router.patch(
  '/students/:studentId',
  validateRequest(updateStudentValidationSchema),
  StudentControllers.updateStudent,
)

// Route to update student progress
router.patch('/students/:studentId/progress', StudentControllers.updateStudentProgress)

// Route to delete student
router.delete('/students/:studentId', StudentControllers.deleteStudent)

export const StudentRoute = router
