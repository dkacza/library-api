import isEmptyObject from '../utils/isEmptyObject.mjs';
import Rental from '../models/rental.mjs';

const rentalAggregation = function(query, user = undefined) {

  let queryString = JSON.stringify(query);
  queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  const parsedQuery = JSON.parse(queryString);

  // Joining and projecting
  let userIdStage = {};
  if (user.role === 'user') {
    userIdStage = { $match: { user: user._id } };
  }
  const joinBooksStage = [
    {
      $lookup: {
        from: 'books',
        localField: 'book',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              title: 1,
              isbn: 1
            }
          }
        ],
        as: 'bookData'
      }
    },
    { $unwind: '$bookData' }
  ];

  const projectBookFieldsStage = [{
    $set: {
      'title': '$bookData.title',
      'isbn': '$bookData.isbn'
    }
  }, {
    $project: {
      'bookData': 0
    }
  }];

  const joinUsersStage = [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              phoneNumber: 1
            }
          }
        ],
        as: 'userData'
      }
    },
    { $unwind: '$userData' }
  ];

  const projectUsersFieldsStage = [{
    $set: {
      'firstName': '$userData.firstName',
      'lastName': '$userData.lastName',
      'email': '$userData.email',
      'phoneNumber': '$userData.phoneNumber'
    }
  }, {
    $project: {
      'userData': 0
    }
  }];

  // Filters
  let filterByStatusStage = {};
  if (parsedQuery.currentStatus) {
    filterByStatusStage = {
      $match: {
        $or: []
      }
    };
    const statuses = parsedQuery.currentStatus.split(',');
    statuses.forEach(status => {
      filterByStatusStage.$match.$or.push({ currentStatus: status });
    });
  }

  let filterByStartDateStage = {};
  if (parsedQuery.startDate) {
    filterByStartDateStage = {
      $match: {
        startDate: {}
      }
    };
    filterByStartDateStage.$match.startDate = (parsedQuery.startDate);
    for (const [key, val] of Object.entries(filterByStartDateStage.$match.startDate)) {
      filterByStartDateStage.$match.startDate[key] = new Date(val);
    }
  }

  let filterByReturnDateStage = {};
  if (parsedQuery.returnDate) {
    filterByReturnDateStage = {
      $match: {
        returnDate: {}
      }
    };
    filterByReturnDateStage.$match.returnDate = (parsedQuery.returnDate);
    for (const [key, val] of Object.entries(filterByReturnDateStage.$match.returnDate)) {
      filterByReturnDateStage.$match.returnDate[key] = new Date(val);
    }
  }

  let searchByBookStage = {};
  if (parsedQuery.bookSearch) {
    searchByBookStage = {
      $match: {
        $or: [
          { title: { $regex: new RegExp(parsedQuery.bookSearch, 'i') } },
          { isbn: { $regex: new RegExp(parsedQuery.bookSearch, 'i') } }
        ]
      }
    };
  }

  let searchByUserStage = {};
  if (parsedQuery.userSearch) {
    searchByBookStage = {
      $match: {
        $or: [
          { firstName: { $regex: new RegExp(parsedQuery.userSearch, 'i') } },
          { lastName: { $regex: new RegExp(parsedQuery.userSearch, 'i') } },
          { phoneNumber: { $regex: new RegExp(parsedQuery.userSearch, 'i') } },
          { email: { $regex: new RegExp(parsedQuery.userSearch, 'i') } }
        ]
      }
    };
  }

  let paginationStages = [];
  if (parsedQuery.page && parsedQuery.limit) {
    const page = Number(parsedQuery.page) || 1;
    const limit = Number(parsedQuery.limit) || 100;
    const toSkip = (page - 1) * limit;
    paginationStages.push({
      $facet: {
        paginatedResults: [
          { $skip: toSkip },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    });
    paginationStages.push({
      $unwind: {
        path: '$totalCount'
      }
    });
  }


  const aggregationStages = [];
  // 1. Match only logged-in user if not admin
  if (user.role === 'user') {
    if (!isEmptyObject(userIdStage)) aggregationStages.push(userIdStage);
  }
  // 2. Filter by status and date
  if (!isEmptyObject(filterByStatusStage)) aggregationStages.push(filterByStatusStage);
  if (!isEmptyObject(filterByStartDateStage)) aggregationStages.push(filterByStartDateStage);
  if (!isEmptyObject(filterByReturnDateStage)) aggregationStages.push(filterByReturnDateStage);

  // 3. Join books
  aggregationStages.push(...joinBooksStage);
  aggregationStages.push(...projectBookFieldsStage);

  // 4. Join user data
  aggregationStages.push(...joinUsersStage);
  aggregationStages.push(...projectUsersFieldsStage);

  // 5. Search by book title
  if (!isEmptyObject(searchByBookStage)) aggregationStages.push(searchByBookStage);

  // 6. Search by user
  if (!isEmptyObject(searchByUserStage)) aggregationStages.push(searchByUserStage);

  // 7. Paginate
  aggregationStages.push(...paginationStages);


  return Rental.aggregate(aggregationStages);
};
export default rentalAggregation;