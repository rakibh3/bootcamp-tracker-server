import httpStatus from 'http-status'

import {QueryBuilder} from '@/builder'
import {AppError} from '@/error'
import {TStudent} from '@/modules/student/student.interface'
import {Student} from '@/modules/student/student.model'
import {User} from '@/modules/user/user.model'
import {invalidateCache} from '@/utils/redisCache'

/**
 * Initializes a new student profile for an existing user
 */
/**
 * Initializes a new student profile, creating or linking to a user account
 */
const createStudentIntoDatabase = async (payload: any) => {
  const session = await Student.startSession()
  let result

  try {
    session.startTransaction()

    // 1. Check if user exists
    let user = await User.findOne({
      $or: [{email: payload.email}, {phone: payload.phone}],
    }).session(session)

    // 2. If user doesn't exist, create new user
    if (!user) {
      const newUser = await User.create(
        [
          {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            role: 'STUDENT',
          },
        ],
        {session},
      )
      user = newUser[0]
    }

    // 3. Check if student profile already exists for this user
    const existingStudent = await Student.findOne({userId: user._id}).session(session)
    if (existingStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Student profile already exists for this user')
    }

    // 4. Create student profile linked to user
    const newStudent = await Student.create(
      [
        {
          userId: user._id,
          discordUsername: payload.discordUsername,
        },
      ],
      {session},
    )

    result = newStudent[0]

    await session.commitTransaction()
    await session.endSession()
  } catch (error) {
    await session.abortTransaction()
    await session.endSession()
    throw error
  }

  return result
}

/**
 * Retrieves all student profiles with filtering, searching, and pagination
 */
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

  return {result, meta}
}

/**
 * Fetches a single student profile by its document ID
 */
const getStudentByIdFromDatabase = async (studentId: string) => {
  const result = await Student.findById(studentId).populate('userId', 'name email phone')
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }
  return result
}

/**
 * Retrieves a student profile based on the associated User ID
 */
const getStudentByUserIdFromDatabase = async (userId: string) => {
  const result = await Student.findOne({userId: userId}).populate('userId', 'name email phone')
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }
  return result
}

/**
 * Updates an existing student profile's information
 */
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

/**
 * Permanently removes a student profile document
 */
const deleteStudentFromDatabase = async (studentId: string) => {
  const result = await Student.findByIdAndDelete(studentId)
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }
  return result
}

/**
 * Updates a student's progress tracking (current mission and module)
 */
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
    {new: true, runValidators: true},
  )

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found')
  }

  return result
}

/**
 * Assigns one or more students to a specific SRM (mentor)
 */
const assignStudentsToSRMInDatabase = async (srmId: string, studentIds: string[]) => {
  const srm = await User.findById(srmId)
  if (!srm || srm.role !== 'SRM') {
    throw new AppError(httpStatus.NOT_FOUND, 'SRM not found or user is not an SRM')
  }

  const result = await Student.updateMany({userId: {$in: studentIds}}, {assignedSrmId: srmId})

  if (result.matchedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No students found with the provided IDs')
  }
  await invalidateCache('cache:attendance:*')
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    message: `${result.modifiedCount} student(s) assigned to SRM successfully`,
  }
}

export const StudentServices = {
  createStudentIntoDatabase,
  getAllStudentsFromDatabase,
  getStudentByIdFromDatabase,
  getStudentByUserIdFromDatabase,
  updateStudentInDatabase,
  deleteStudentFromDatabase,
  updateStudentProgressInDatabase,
  assignStudentsToSRMInDatabase,
}
