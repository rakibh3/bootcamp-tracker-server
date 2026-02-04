import httpStatus from 'http-status'
import AppError from '@/error/AppError'
import { TStudent } from './student.interface'
import { Student } from './student.model'
import { User } from '../user/user.model'
import QueryBuilder from '@/builder/QueryBuilder'

const createStudentIntoDatabase = async (payload: TStudent) => {
  const existingStudent = await Student.findOne({ userId: payload.userId })
  if (existingStudent) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Student already exists for this user')
  }

  const result = await Student.create(payload)
  return result
}

const getAllStudentsFromDatabase = async (query: Record<string, unknown>) => {
  const searchableFields = ['notes']
  const studentQuery = new QueryBuilder(
    Student.find().populate('userId', 'name email phone'),
    query,
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await studentQuery.modelQuery
  const meta = await studentQuery.countTotal()

  return { result, meta }
}

const getStudentByIdFromDatabase = async (studentId: string) => {
  const result = await Student.findById(studentId).populate('userId', 'name email phone')
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }
  return result
}

const getStudentByUserIdFromDatabase = async (userId: string) => {
  const result = await Student.findOne({ userId: userId }).populate('userId', 'name email phone')
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }
  return result
}

const updateStudentInDatabase = async (studentId: string, payload: Partial<TStudent>) => {
  const result = await Student.findByIdAndUpdate(studentId, payload, {
    new: true,
    runValidators: true,
  }).populate('userId', 'name email phone')

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }

  return result
}

const deleteStudentFromDatabase = async (studentId: string) => {
  const result = await Student.findByIdAndDelete(studentId)
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }
  return result
}

const getStudentsByBatchFromDatabase = async (batchNumber: number) => {
  const result = await Student.find({ batchNumber }).populate('userId', 'name email phone')
  return result
}

const updateStudentProgressInDatabase = async (
  studentId: string,
  mission: number,
  module: number,
) => {
  const result = await Student.findByIdAndUpdate(
    studentId,
    {
      currentMission: mission,
      currentModule: module,
    },
    { new: true, runValidators: true },
  )

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }

  return result
}

const assignStudentsToSRMInDatabase = async (srmId: string, studentIds: string[]) => {
  // Verify if the SRM exists and has the SRM role
  const srm = await User.findById(srmId)
  if (!srm || srm.role !== 'SRM') {
    throw new AppError(httpStatus.NOT_FOUND, 'SRM not found or user is not an SRM')
  }

  const result = await Student.updateMany(
    { _id: { $in: studentIds } },
    { assignedSrmId: srmId },
  )
  return result
}

export const StudentServices = {
  createStudentIntoDatabase,
  getAllStudentsFromDatabase,
  getStudentByIdFromDatabase,
  getStudentByUserIdFromDatabase,
  updateStudentInDatabase,
  deleteStudentFromDatabase,
  getStudentsByBatchFromDatabase,
  updateStudentProgressInDatabase,
  assignStudentsToSRMInDatabase,
}
