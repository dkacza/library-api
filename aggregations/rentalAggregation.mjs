import isEmptyObject from '../utils/isEmptyObject.mjs';
import Rental from '../models/rental.mjs';

const rentalAggregation = function([searchFields], query, user = undefined ) {

    let queryString = JSON.stringify(query);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    const parsedQuery = JSON.parse(queryString);

    // Joining and projecting
    let userIdStage = {};
    if (user) {
        userIdStage = {$match: {user: user._id}};
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
        {$unwind: '$bookData'}
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
            filterByStatusStage.$match.$or.push({currentStatus: status});
        });
    }

    let filterByStartDateStage = {};
    if (parsedQuery.startDate ) {
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
        }
        filterByReturnDateStage.$match.returnDate = (parsedQuery.returnDate);
        for (const [key, val] of Object.entries(filterByReturnDateStage.$match.returnDate)) {
            filterByReturnDateStage.$match.returnDate[key] = new Date(val);
        }
    }

    let searchByTitleStage = {};
    if (parsedQuery.search) {
        searchByTitleStage = {
            $match: {
                title: {$regex: new RegExp(parsedQuery.search, 'i')}
            }
        }
    }

    let paginationStages = [];
    if (parsedQuery.page && parsedQuery.limit) {
        const page = Number(parsedQuery.page) || 1;
        const limit = Number(parsedQuery.limit) || 100;
        const toSkip = (page - 1) * limit;
        paginationStages.push({
            $facet: {
                paginatedResults: [
                    {$skip: toSkip},
                    {$limit: limit}
                ],
                totalCount: [
                    {$count: 'count'}
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
    if (!isEmptyObject(filterByStatusStage)) aggregationStages.push(userIdStage);
    if (!isEmptyObject(filterByStatusStage)) aggregationStages.push(filterByStatusStage);
    if (!isEmptyObject(filterByStartDateStage)) aggregationStages.push(filterByStartDateStage);
    if (!isEmptyObject(filterByReturnDateStage)) aggregationStages.push(filterByReturnDateStage);
    aggregationStages.push(...joinBooksStage);
    aggregationStages.push(...projectBookFieldsStage);
    if (!isEmptyObject(searchByTitleStage)) aggregationStages.push(searchByTitleStage);
    aggregationStages.push(...paginationStages);

    return Rental.aggregate(aggregationStages);
}
export default rentalAggregation;