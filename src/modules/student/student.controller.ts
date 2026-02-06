import httpStatus from 'http-status'

import {StudentServices} from '@/modules/student/student.service'
import {catchAsync, sendResponse} from '@/utils'

/**
 * Handles request to create a new student record
 */
const createStudent = catchAsync(async (req, res) => {
  const result = await StudentServices.createStudentIntoDatabase(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Student created successfully',
    data: result,
  })
})

/**
 * Handles request to fetch all student records with advanced filtering
 */
const getAllStudents = catchAsync(async (req, res) => {
  const {result, meta} = await StudentServices.getAllStudentsFromDatabase(req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students fetched successfully',
    data: {students: result, meta},
  })
})

/**
 * Handles request to fetch a specific student record by its document ID
 */
const getStudentById = catchAsync(async (req, res) => {
  const {studentId} = req.params
  const result = await StudentServices.getStudentByIdFromDatabase(studentId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student fetched successfully',
    data: result,
  })
})

/**
 * Handles request to fetch a student profile by associated User ID
 */
const getStudentByUserId = catchAsync(async (req, res) => {
  const {userId} = req.params
  const result = await StudentServices.getStudentByUserIdFromDatabase(userId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student fetched successfully',
    data: result,
  })
})

/**
 * Handles request to update student information
 */
const updateStudent = catchAsync(async (req, res) => {
  const {studentId} = req.params
  const result = await StudentServices.updateStudentInDatabase(studentId as string, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student updated successfully',
    data: result,
  })
})

/**
 * Handles request to delete a student record
 */
const deleteStudent = catchAsync(async (req, res) => {
  const {studentId} = req.params
  const result = await StudentServices.deleteStudentFromDatabase(studentId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student deleted successfully',
    data: result,
  })
})

/**
 * Handles request to update a student's educational progress
 */
const updateStudentProgress = catchAsync(async (req, res) => {
  const {studentId} = req.params
  const {mission, module} = req.body
  const result = await StudentServices.updateStudentProgressInDatabase(
    studentId as string,
    mission,
    module,
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student progress updated successfully',
    data: result,
  })
})

/**
 * Handles request to assign multiple students to a specific SRM
 */
const assignStudentsToSRM = catchAsync(async (req, res) => {
  const {srmId, studentIds} = req.body
  const result = await StudentServices.assignStudentsToSRMInDatabase(srmId, studentIds)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students assigned to SRM successfully',
    data: result,
  })
})

export const StudentControllers = {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentByUserId,
  updateStudent,
  deleteStudent,
  updateStudentProgress,
  assignStudentsToSRM,
}
