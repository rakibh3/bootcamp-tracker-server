import mongoose, {Query} from 'mongoose'

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>
  public query: Record<string, unknown>

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery
    this.query = query
  }

  // Search query
  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: {$regex: searchTerm, $options: 'i'},
            }) as any,
        ),
      })
    }

    return this
  }

  // Filter query
  filter() {
    const queryObj = {...this.query}

    // Filtering
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields', 'absentFilter']
    excludeFields.forEach((el) => delete queryObj[el])

    // Convert all string values to case-insensitive regex
    Object.keys(queryObj).forEach((key) => {
      if (typeof queryObj[key] === 'string') {
        queryObj[key] = {$regex: queryObj[key], $options: 'i'}
      }
    })

    this.modelQuery = this.modelQuery.find(queryObj as any)
    return this
  }

  // Sort query
  sort() {
    const sortBy = this?.query?.sort
    if (sortBy) {
      this.modelQuery = this.modelQuery.sort(sortBy as string)
    } else {
      this.modelQuery = this.modelQuery.sort('-createdAt')
    }

    return this
  }

  // Pagination query
  paginate() {
    const page = Number(this?.query?.page) || 1
    const limit = Number(this?.query?.limit) || 10
    const skip = (page - 1) * limit

    this.modelQuery = this.modelQuery.skip(skip).limit(limit)

    return this
  }

  // Fields limiting
  fields() {
    const fields = (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v'

    this.modelQuery = this.modelQuery.select(fields)
    return this
  }

  // Filter by absent attendance within date range
  filterAbsent(
    getDhakaTimeRange: () => {
      startOfDay: Date
      endOfDay: Date
      dhakaTime: Date
    },
  ) {
    const absentFilter = this?.query?.absentFilter as string | undefined

    if (absentFilter && ['today', 'last2days', 'last3days'].includes(absentFilter)) {
      const {startOfDay: todayStart, endOfDay: todayEnd} = getDhakaTimeRange()

      let startDate: Date
      const endDate: Date = todayEnd

      switch (absentFilter) {
        case 'today':
          startDate = todayStart
          break
        case 'last2days':
          startDate = new Date(todayStart.getTime() - 2 * 24 * 60 * 60 * 1000)
          break
        case 'last3days':
          startDate = new Date(todayStart.getTime() - 3 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = todayStart
      }

      // Filter users who have at least one ABSENT record within the date range
      this.modelQuery = this.modelQuery.find({
        attendance: {
          $elemMatch: {
            status: 'ABSENT',
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
      } as any)
    }

    return this
  }

  // Count total documents
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter()
    const total = await this.modelQuery.model.countDocuments(totalQueries)
    const page = Number(this?.query?.page) || 1
    const limit = Number(this?.query?.limit) || 10
    const totalPage = Math.ceil(total / limit)

    return {
      page,
      limit,
      total,
      totalPage,
    }
  }
}

export default QueryBuilder
