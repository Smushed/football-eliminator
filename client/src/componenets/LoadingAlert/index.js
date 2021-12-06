import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

export const loading = () => {
    Alert.fire({
        title: 'Loading',
        imageUrl: 'https://media.giphy.com/media/3o7aDczpCChShEG27S/giphy.gif',
        imageWidth: 200,
        imageHeight: 200,
        imageAlt: 'Loading Football',
        showConfirmButton: false,
        showCancelButton: false
    });
};

export const doneLoading = () => {
    Alert.close()
};