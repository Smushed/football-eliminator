import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import Modal from 'react-modal';
import { withFirebase } from '../Firebase';
import PropTypes from 'prop-types';
import Cropper from 'react-easy-crop';
import Slider from 'rc-slider';
import Jimp from 'jimp';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import 'rc-slider/assets/index.css';
import './userProfileStyle.css';

const Alert = withReactContent(Swal);

const UserProfile = ({ authUser, currentUser, groupList, firebase }) => {

    const [teamList, setTeamList] = useState([]);
    // const [changedFields, updateChangedFields] = useState([]);
    const [showPassword, updateShowPassword] = useState(`password`);
    const [modalOpen, updateModal] = useState(false);
    const [modalState, updateModalState] = useState('reAuth');
    const [updatedFields, changeUpdatedFields] = useState({ email: ``, password: ``, username: `` });
    const [avatar, updateAvatar] = useState(``);

    useEffect(() => {
        axios.get(`/api/getTeamList`)
            .then(res => setTeamList(res.data));
    }, [currentUser]);

    // const sendAuthEmail = (authUser) => {
    //     authUser.sendEmailVerification();
    //     this.setState({ emailSent: true });
    // };

    const openCloseModal = () => {
        updateModal(!modalOpen);
    };


    const handleChange = (e) => {
        if (e.target.name === `avatar`) {

            //Checks if the file uploaded is an image
            if (!!e.target.files[0].type.match('image.*')) {
                Jimp.read((URL.createObjectURL(e.target.files[0])), (err, img) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    const { height, width } = img.bitmap;
                    if (height > 200 || width > 200) {
                        Alert.fire({
                            title: 'Large Image Selected',
                            text: 'Image is over 200px in width or height, would you like to resize it?',
                            showConfirmButton: true,
                            showCancelButton: true,
                        }).then(async res => {
                            if (res.value) {
                                width > height ? img.resize(Jimp.AUTO, 200) : img.resize(200, Jimp.AUTO);
                                console.log(img)
                                const mime = await img.getBase64Async(Jimp.MIME_JPEG);
                                updateAvatar(mime);
                            } else {
                                console.log(img)
                                const mime = await img.getBase64Async(Jimp.MIME_JPEG);
                                updateAvatar(mime);
                            }
                        })
                    }
                })
                updateModalState(`avatar`);
                openCloseModal();
            } else {
                notAnImage();
                e.target.value = '';
            }
            // updateAvatar((URL.createObjectURL(e.target.files[0])));
        }
        //Putting this after the avatar check in case they upload a non image
        changeUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value })

        if (e.target.name === `togglePassword`) {
            e.target.value === `password` ? updateShowPassword(`text`) : updateShowPassword(`password`);
            return;
        }
    };

    const handleSubmit = () => {
        // if (changedFields.length < 1) {
        //     return;
        // };

        updateModal(!modalOpen);


        // authUser.reauthenticateWithCredential(cred).then(res => {
        //     console.log(`reauth`, res)
        // }).catch(err => {
        //     console.log(err);
        // });
    };

    const notAnImage = () => {
        Alert.fire({
            title: 'Only Upload Images',
            text: 'Image not selected. Please only upload images',
            showConfirmButton: false,
            showCancelButton: true,
        });
    };

    return (
        <Fragment>
            <div className={'userProfileWrapper ' + (modalOpen && 'greyBackdrop')}>
                <div className='userProfileLeft'>
                    <div className='profileName'>
                        {currentUser.username}&apos;s Profile
                    </div>
                    <div className='favoriteTeamPicture'>
                        <img src={avatar} />
                        {/* <img src={Logos[updatedFields.favoriteTeam] || Logos[currentUser.FT]} /> */}
                    </div>
                </div>
                <div className='userProfileRight'>
                    <UsernameInput
                        handleChange={handleChange}
                        username={updatedFields.username}
                        currentUser={currentUser}
                    />
                    <PasswordInput
                        handleChange={handleChange}
                        password={updatedFields.password}
                        showPassword={showPassword}
                    />
                    <EmailInput
                        authUser={authUser}
                        handleChange={handleChange}
                        email={updatedFields.email}
                    />
                    <div className='editField'>
                        <div className='input-group input-group-lg'>
                            <span className='input-group-text fieldDescription'>
                                Avatar:
                            </span>
                            <input type='file' name='avatar' onChange={handleChange} />
                            {/* <select className='form-control form-control-sm' name='favoriteTeam' value={updatedFields.favoriteTeam || currentUser.FT} onChange={handleChange}>
                                {teamList.map(team => <option key={team} value={team}>{team}</option>)}
                            </select> */}
                        </div>
                    </div>
                    <div className='submitButtonWrapper'>
                        <button className='btn btn-primary btn-lg' onClick={() => handleSubmit()}>
                            Submit
                        </button>
                    </div>
                    <div className='editField'>
                        <div>
                            Joined Groups:
                        </div>
                        {groupList.map((group) => <div key={group.N}>{group.N} {group.D} {group._id}</div>)}
                    </div>
                </div>
            </div>
            <Modal
                onRequestClose={openCloseModal}
                isOpen={modalOpen}
                contentLabel='profileModal'
                className='userProfileModal'
                overlayClassName='modalOverlay'
                ariaHideApp={false}>
                {modalState === 'reAuth' ?
                    <ReAuth
                        openCloseModal={openCloseModal}
                        firebase={firebase}
                        updatedFields={updatedFields}
                        authUser={authUser}
                        currentUser={currentUser}
                    />
                    :
                    <ImageEditor
                        avatar={avatar}
                    />
                }
                <button onClick={() => openCloseModal()}>
                    Close Button
                </button>
            </Modal>
        </Fragment>
    );
};

const ReAuth = ({ firebase, updatedFields, authUser, openCloseModal, currentUser }) => {

    const [email, setEmail] = useState(``);
    const [password, setPassword] = useState(``);
    const [showPassword, toggleShowPassword] = useState(`password`);
    const [loginErr, addLoginErr] = useState(``);

    const handleUpdate = () => {
        const request = {};
        let needToUpdateDb = false;
        if (updatedFields.password !== '') {
            authUser.updatePassword(updatedFields.password);
        }
        if (updatedFields.email !== '') {
            authUser.updateEmail(updatedFields.email);
            request.E = updatedFields.email;
            needToUpdateDb = true;
        }
        if (updatedFields.username !== '') {
            request.UN = updatedFields.username;
            needToUpdateDb = true;
        }
        if (needToUpdateDb) {
            axios.put(`/api/updateProfile`, { request, userId: currentUser.userId })
                .then(res => console.log(res))
        }
    };

    const handleReAuth = () => {
        firebase.doSignInWithEmailAndPassword(email, password)
            .then(res => {
                openCloseModal()
                if (res.credential !== null) {
                    firebase.auth.currentUser.reauthenticateWithCredential(res.credential)
                        .then(() => handleUpdate())
                        .catch(err => console.log(`err`, err));
                } else {
                    handleUpdate();
                }
            })
            .catch(err => addLoginErr(err.message));
    };

    const handleChange = (e) => {
        e.target.name === `email` && setEmail(e.target.value);
        e.target.name === `password` && setPassword(e.target.value);
        if (e.target.name === `togglePassword`) {
            e.target.value === `password` ? toggleShowPassword(`text`) : toggleShowPassword(`password`);
            return;
        }
    };

    const fillInfo = () => {
        setEmail('smushedcode@gmail.com');
        setPassword('123456');
    };

    return (
        <Fragment>
            <div>To update profile, please enter your login information</div>
            <div>{loginErr}</div>
            <EmailInput
                handleChange={handleChange}
                email={email}
            />
            <PasswordInput
                handleChange={handleChange}
                password={password}
                showPassword={showPassword}
            />
            <button onClick={fillInfo}>Fill Info</button>
            <button onClick={handleReAuth} >Re-Login</button>
        </Fragment>
    );
};

const ImageEditor = ({ avatar }) => {
    const [crop, updateCrop] = useState({ x: 0, y: 0 });
    const [zoom, updateZoom] = useState(1);

    const sliderChange = val => updateZoom(val);

    return (
        <Fragment>
            <Cropper
                image={avatar}
                crop={crop}
                zoom={zoom}
                aspect={1}
                zoomSpeed={0.10}
                onCropChange={updateCrop}
                onZoomChange={updateZoom}
            />
            <Slider
                min={1}
                max={3}
                value={zoom}
                onChange={sliderChange}
                step={0.10}
                railStyle={{
                    height: 2
                }}
                handleStyle={{
                    height: 28,
                    width: 28,
                    marginLeft: -14,
                    marginTop: -14,
                    backgroundColor: "blue",
                    border: 0
                }}
                trackStyle={{
                    background: "none"
                }}
            />
        </Fragment>
    );
};

const UsernameInput = ({ handleChange, username, currentUser }) =>
    <div className='editField'>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Username:
            </span>
            <input className='form-control' name='username' value={username} type='text' onChange={handleChange} placeholder={currentUser.username} />
        </div>
    </div>;

const PasswordInput = ({ handleChange, password, showPassword }) =>
    <div className='editField'>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Password:
                    </span>
            <input className='form-control' name='password' value={password} type={showPassword} onChange={handleChange} placeholder='Password' />
            <span className='input-group-text fieldDescription'>
                <input className='largeCheckbox input-group-text fieldDescription' type='checkbox' value={showPassword} name='togglePassword' onChange={handleChange} />
                &nbsp;Show
            </span>
        </div>
    </div>;

const EmailInput = ({ email, handleChange, authUser }) =>
    <div className='editField'>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Email:
            </span>
            <input className='form-control' name='email' value={email} type='email' onChange={handleChange} placeholder={authUser ? authUser.email : 'Email'} />
        </div>
    </div>;

ImageEditor.propTypes = {
    avatar: PropTypes.any
}

UserProfile.propTypes = {
    authUser: PropTypes.any,
    currentUser: PropTypes.object,
    groupList: PropTypes.array,
    firebase: PropTypes.any
};

UsernameInput.propTypes = {
    handleChange: PropTypes.func,
    username: PropTypes.string,
    currentUser: PropTypes.object
};

EmailInput.propTypes = {
    email: PropTypes.string,
    handleChange: PropTypes.func,
    authUser: PropTypes.any
};

PasswordInput.propTypes = {
    handleChange: PropTypes.func,
    password: PropTypes.string,
    showPassword: PropTypes.string
};

ReAuth.propTypes = {
    firebase: PropTypes.any,
    updatedFields: PropTypes.object,
    authUser: PropTypes.any,
    openCloseModal: PropTypes.func,
    currentUser: PropTypes.object
};

//REAUTH a user in order for them to update any of these
//Username - Password - Email

//Update Favorite Team

//Manage (aka leave) groups from here
//Groups


// const VerifyEmailButton = ({ authUser }) =>
//     <div className='verifyEmailDiv floatRight notifications'>
//         Please Verify your Email
//     <br />
//         <button className='btn btn-info' onClick={() => this.sendAuthEmail(authUser)}>Send Verification Email</button>
//     </div>;

// const SentVerifyEmail = () => <div className='sentEmail floatRight notifications'>Email has been sent</div>;

// const SmallVerifyEmailButton = ({ authUser }) =>
//     <div className='verifyEmailDiv floatRight notifications smallVerifyEmailBtn'>
//         <button className='btn btn-info btn-sm' onClick={() => this.sendAuthEmail(authUser)}>Verifiy Email</button>
//     </div>;

// const SmallSentVerifyEmail = () => <div className='sentEmail smallSentEmail floatRight notifications'>Sent!</div>;

const condition = authUser => !!authUser;

export default withFirebase(withAuthorization(condition)(UserProfile));