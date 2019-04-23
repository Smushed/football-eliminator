const userHandler = require(`../handlers/userHandler`);
const bookHandler = require(`../handlers/bookHandler`);


module.exports = app => {

    app.get(`/api/searchbook/:book`, async (req, res) => {
        const searchedBook = req.params.book;
        const response = await bookHandler.searchGoogleBook(searchedBook);
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(500).send({ 'error': 'No Books Found' })
        }

    });

    //While this is adding a book to a group, this is more relating to books
    app.post(`/api/addbook`, async (req, res) => {
        //When the user picks a book from google books, this takes the data and saves it down
        const { chosenBook, groupID, isAdmin } = req.body;

        const bookForGroup = await bookHandler.queryAndSaveToDB(chosenBook);

        //Checks if the user is a mod of the group they're currently trying to update
        if (isAdmin) {
            //This function will move the current book into the past book and add the book in chosenBook to the current book
            const updatedGroup = await bookHandler.updateCurrentBook(bookForGroup._id, groupID);
            res.status(200).send(updatedGroup);
        } else {
            //TODO Add something to show if they tried to update a group they weren't a mod for
            res.json({ 'error': `Moderator needed to update book` });
            return;
        }
    });

    app.get(`/api/getbookdata/:bookID`, async (req, res) => {
        const { bookID } = req.params;
        const response = await bookHandler.getBookData(bookID);
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(500).send({ 'error': 'No Books Found' })
        }
    });
}