const bookController = {};

bookController.getAllBooks = function(req, res, next) {
    res.status(200).json({
        status: 'success',
        message: 'GET ALL BOOKS'
    })
}
bookController.getSingleBook = function(req, res, next) {
    res.status(200).json({
        status: 'success',
        message: 'GET SINGLE BOOK'
    })
}
bookController.createBook = function(req, res, next) {
    res.status(200).json({
        status: 'success',
        message: 'CREATE BOOK'
    })
}
bookController.updateBook = function(req, res, next) {
    res.status(200).json({
        status: 'success',
        message: 'UPDATE BOOK'
    })
}
bookController.deleteBook = function(req, res, next) {
    res.status(200).json({
        status: 'success',
        message: 'DELETE BOOK'
    })
}

export default bookController;