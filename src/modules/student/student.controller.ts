import httpStatus from 'http-status'
import { catchAsync } from '@/utils/catchAsync'
import { sendResponse } from '@/utils/sendResponse'
import { StudentServices } from './student.service'

const createStudent = catchAsync(async (req, res) => {
  const result = await StudentServices.createStudentIntoDatabase(req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Student created successfully',
    data: result,
  })
})

const getAllStudents = catchAsync(async (req, res) => {
  const { result, meta } = await StudentServices.getAllStudentsFromDatabase(req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students fetched successfully',
    data: { students: result, meta },
  })
})

const getStudentById = catchAsync(async (req, res) => {
  const { studentId } = req.params
  const result = await StudentServices.getStudentByIdFromDatabase(studentId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student fetched successfully',
    data: result,
  })
})

const getStudentByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params
  const result = await StudentServices.getStudentByUserIdFromDatabase(userId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student fetched successfully',
    data: result,
  })
})

const updateStudent = catchAsync(async (req, res) => {
  const { studentId } = req.params
  const result = await StudentServices.updateStudentInDatabase(studentId as string, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student updated successfully',
    data: result,
  })
})

const deleteStudent = catchAsync(async (req, res) => {
  const { studentId } = req.params
  const result = await StudentServices.deleteStudentFromDatabase(studentId as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student deleted successfully',
    data: result,
  })
})

const getStudentsByBatch = catchAsync(async (req, res) => {
  const { batchNumber } = req.params
  const result = await StudentServices.getStudentsByBatchFromDatabase(Number(batchNumber))

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students fetched successfully',
    data: result,
  })
})

const updateStudentProgress = catchAsync(async (req, res) => {
  const { studentId } = req.params
  const { mission, module } = req.body
  const result = await StudentServices.updateStudentProgressInDatabase(studentId as string, mission, module)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student progress updated successfully',
    data: result,
  })
})

const assignStudentsToSRM = catchAsync(async (req, res) => {
  const { srmId, studentIds } = req.body
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
  getStudentsByBatch,
  updateStudentProgress,
  assignStudentsToSRM,
}
