import Author from './../models/author.mjs';


const authorController = {};

authorController.getAllAuthors = async function (req, res, next) {
    try {
        const authors = await Author.find();
        res.status(200).json({
            status: 'success',
            data: {
                authors
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            data: err
        })
    }
}
authorController.getAuthor = async function (req, res, next) {
    try {
        const id = req.params.id;
        const author = await Author.findById(id);

        res.status(200).json({
            status: 'success',
            data: {
                author
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            data: err
        });
    }


}
authorController.createAuthor = async function (req, res, next) {
    try {
        const author = await Author.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                author
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            data: err
        })
    }
}

authorController.updateAuthor = async function (req, res, next) {
    try {
        const id = req.params.id;
        const author = await Author.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        res.status(200).json({
            status: 'success',
            data: {
                author
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            data: err
        })
    }
}

authorController.deleteAuthor = async function (req, res, next) {
    try {
        const id = req.params.id;
        await Author.findByIdAndDelete(id);

        res.status(200).json({
            status: 'success',
            data: {}
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            data: err
        })
    }
}

export default authorController;