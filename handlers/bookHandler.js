const axios = require(`axios`);
const db = require(`../models`);

const checkForISBN = (industryIdentifiers) => {
    //Goes through the data that google returned and searches if the book has an ISBN number tied to it
    //If it doesn't then it will not be returned

    if (!industryIdentifiers) {
        return false;
    }

    const hasISBN13 = industryIdentifiers.find(id => id.type === `ISBN_13`);
    const hasISBN10 = industryIdentifiers.find(id => id.type === `ISBN_10`);

    if (hasISBN13 || hasISBN10) {
        return true;
    } else {
        return false;
    };
};

const checkForAllFields = (title, authors, thumbnail, pageCount, publishedDate, description) => {

    if (title && authors && thumbnail && pageCount && publishedDate && description) {
        return true;
    } else {
        return false;
    };
};

const checkDuplicate = async (fieldToCheck, valueToCheck, groupID) => {
    let isDuplicate = false;
    switch (fieldToCheck) {
        case `book`:
            try {
                const searchedBook = await db.Book.findOne({ title: valueToCheck });
                //If there is a book with that name return true
                if (searchedBook !== null) {
                    isDuplicate = true;
                };
            } catch (err) {
                //TODO Something to show the error
                console.log(err, `Line 30 Book Handler`);
            };
            break;
        case `currentBook`: //Checks the current book to make sure they aren't adding the same book twice
            try {
                const searchedGroup = await db.Group.findById([groupID]);
                //If there is a book with that name return true
                if (searchedGroup.currentBook == valueToCheck) {
                    isDuplicate = true;
                };
            } catch (err) {
                //TODO Something to show the error
                console.log(err, `Line 41 Book Handler`);
            }
            break;
    }
    return await isDuplicate;
};

module.exports = {
    //All functions and files are singular on the back end
    //When searching google books spaces need to be turned into +
    searchGoogleBook: async (searchedBook) => {
        const search = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${searchedBook}&maxResults=10&printType=Books`);

        //TODO Try and do this in one ForEach or something
        const allISBNArray = await search.data.items.filter(book => checkForISBN(book.volumeInfo.industryIdentifiers));
        const searchedBookArray = await allISBNArray.filter(book => {

            const { title, authors, pageCount, publishedDate, description } = book.volumeInfo;
            const { thumbnail } = book.volumeInfo.imageLinks;

            return checkForAllFields(title, authors, thumbnail, pageCount, publishedDate, description);
        });

        //Right now this is the best way I can think of returning the correct array
        //First we filter above to get rid of all books without an ISBN
        //Then we map through the array to pull out only the data we need
        const returnedBookList = await searchedBookArray.map(book => {

            const newBook = {
                title: book.volumeInfo.title,
                authors: book.volumeInfo.authors, //This comes back as an array, could be changed if we only want one
                image: book.volumeInfo.imageLinks.thumbnail,
                pageCount: book.volumeInfo.pageCount,
                publishedDate: book.volumeInfo.publishedDate,
                description: book.volumeInfo.description
            };
            return newBook;
        });

        return returnedBookList;
    },
    queryAndSaveToDB: async (savedBook) => {
        //If the book is not a duplicate then save it to the database
        const isDuplicate = await checkDuplicate(`book`, savedBook.title);
        if (!isDuplicate) {
            try {
                const newBook = await db.Book.create(savedBook);
                return newBook;
            } catch (err) {
                //TODO Add an error message here
                return err;
            };
        } else {
            //If the book is a duplicate, then get the book and return it to the user as if it was saved so they can then add it to the group
            try {
                const foundBook = await db.Book.findOne({ title: savedBook.title });
                return foundBook;
            } catch (err) {
                //TODO Add an error message here
                return err;
            };
        };
    },
    updateCurrentBook: async (bookID, groupID) => {
        //First grab the current book the group is going through
        const currentGroup = await db.Group.findById({ _id: groupID });
        //If there is no book in there just put the current book they selected into the app
        if (!currentGroup.currentBook) {
            try {
                const updatedGroup = await db.Group.findByIdAndUpdate([groupID],
                    { $set: { currentBook: bookID } },
                    { new: true })
                return updatedGroup;
            } catch (err) {
                //TODO Add an error message
                return err;
            };
        } else {
            try {
                const isDuplicate = await checkDuplicate(`currentBook`, bookID, groupID);
                //If current book is not currently a duplicate
                //Go and update the current book
                if (!isDuplicate) {
                    await db.Group.findByIdAndUpdate([groupID], { $push: { pastBook: currentGroup.currentBook } });
                    const updatedGroup = await db.Group.findByIdAndUpdate({ _id: groupID },
                        { $set: { currentBook: bookID, currentBenchmark: 0, pageOrChapter: ``, totalPageOrChapter: 0, previousBenchmark: 0 } },
                        { new: true });
                    return updatedGroup;
                } else {
                    return currentGroup;
                }
            } catch (err) {
                //TODO Add an error message
                return err;
            };
        };
    },
    getBookData: async (bookID) => {
        try {
            const response = await db.Book.findById([bookID]);
            return response;
        } catch (err) {
            //TODO Add an error message
            return err;
        }
    }
};
