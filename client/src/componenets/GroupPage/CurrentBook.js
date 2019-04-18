import React, { Component } from 'react';
import axios from 'axios';


const initialState = {
    title: '',
    image: '',
    authors: [],
    error: null
};

const progressBarStyle = {
    position: 'center',
    height: '20px',
    width: '350px',
    borderRadius: '50px',
    border: '1px solid #333',
    marginLeft: 'auto',
    marginRight: 'auto'
};

class CurrentBook extends Component {
    constructor(props) {
        super(props);
        this.state = { ...initialState }
    };

    componentDidMount() {
        const bookID = this.props.currentBook;
        if (bookID) {
            this.getCurrentBook(bookID);
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.currentBook !== prevProps.currentBook) {
            const bookID = this.props.currentBook;
            this.getCurrentBook(bookID)
        };
    };

    getCurrentBook = async (bookID) => {
        const dbResponse = await axios.get(`/api/getbookdata/${bookID}`);
        if (dbResponse.status === 200) {
            this.setState({
                title: dbResponse.data.title,
                image: dbResponse.data.image,
                authors: dbResponse.data.authors
            })
        } else {
            this.setState({
                error: dbResponse.data.error
            });
        };
    };

    render() {
        const percentageComplete = (this.props.currentBenchmark / this.props.totalBenchmark) * 100;
        const { currentBenchmark, totalBenchmark } = this.props;
        const { title, image } = this.state;

        return (
            <div className='currentBook'>
                <div ><strong>Current Book </strong>
                    <br></br>
                    {title}
                    <br></br>
                    <img width='auto' height='75%' src={image} alt={`${title}`} />
                </div>

                <br></br>
                <div ><strong> Current Progress </strong>
                    <br></br>
                    <ProgressBar percentage={percentageComplete} />
                    {currentBenchmark} / {totalBenchmark} </div>
                <br />
            </div>
        );
    };
};

const ProgressBar = (props) => {
    return (
        <div
            style={progressBarStyle}>
            <BarFiller percentage={props.percentage} />
        </div>
    );
};

const BarFiller = (props) => {
    return (
        <div
            style={{
                background: '#1DA598',
                height: '100%',
                borderRadius: 'inherit',
                transition: 'width .2s ease-in',
                width: `${props.percentage}%`
            }} />
    );
};

export default CurrentBook;