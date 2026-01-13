import { FilterQuery, Query } from 'mongoose'

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
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      })
    }

    return this
  }

  // Filter query
  filter() {
    const queryObj = { ...this.query }

    // Filtering
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields']
    excludeFields.forEach((el) => delete queryObj[el])

    // Convert all string values to case-insensitive regex
    Object.keys(queryObj).forEach((key) => {
      if (typeof queryObj[key] === 'string') {
        queryObj[key] = { $regex: queryObj[key], $options: 'i' }
      }
    })

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>)
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
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v'

    this.modelQuery = this.modelQuery.select(fields)
    return this
  }
}

export default QueryBuilder
