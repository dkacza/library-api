class QueryFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter(searchFields = []) {



        let queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Multiple values processing
        if (queryObj.genre) {
            queryObj.genre = queryObj.genre.split(',');
        }
        if (queryObj.currentStatus) {
            queryObj.currentStatus = queryObj.currentStatus.split(',');
        }

        // Date processing
        if (queryObj.publicationDate) {
            for (const [key, value] of Object.entries(
                queryObj.publicationDate
            )) {
                queryObj.publicationDate[key] = new Date().setFullYear(
                    Number(value)
                );
            }
        }

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
        );
        queryObj = JSON.parse(queryStr);

        // Search applying
        if (queryObj.search) {
            const searchFilter = searchFields.map(field => ({
                [field]: {$regex: new RegExp(queryObj.search, 'i')}
            }));
            queryObj.$or = searchFilter;
            delete queryObj.search;
        }



        this.query = this.query.find(queryObj);
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    async paginate() {
        this.total = await this.query.model.countDocuments(this.query);

        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 100;
        const toSkip = (page - 1) * limit;
        this.query = this.query.skip(toSkip).limit(limit);
        return this;
    }
}

export default QueryFeatures;
