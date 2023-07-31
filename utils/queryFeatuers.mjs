class QueryFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);
        
        // Array processing: NEEDS REFACTOR !!!
        // The same file contains better solution to that problem
        for (const [key, value] of Object.entries(queryObj)) {
            if (typeof value === 'string') {
                if (value?.startsWith('[') && value?.endsWith(']') ) {
                    const valuesString = value.substring(1, value.length - 1);
                    const valueArray = valuesString.split(',');
                    queryObj[key] = valueArray;
                }
            }
        }

        // Date processing
        if (queryObj.publicationDate) {
            for (const [key, value] of Object.entries(queryObj.publicationDate)) {
                queryObj.publicationDate[key] = new Date().setFullYear(Number(value));
            }
        }

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
        );

        // Multiple values filter

        this.query = this.query.find(JSON.parse(queryStr));
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
    paginate() {
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 100;
        const toSkip = (page - 1) * limit;
        this.query = this.query.skip(toSkip).limit(limit);
        return this;
    }
}
export default QueryFeatures;
