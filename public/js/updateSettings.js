import axios from 'axios';
import { showAlert } from './alerts';


// Type is either password or data
export const updateSettings = async (data , type) => {
    try{
        const res = await axios({
            method: "PATCH",
            url: `/api/v1/users/${type === 'password' ? 'updateMypassword' : 'updateMe'}`,
            data
        });

        if(res.data.status === 'success'){
            showAlert('success' , `${type.toUpperCase()} updated successfully`);
        }
    }
    
    catch (err){
        showAlert('error' , err.response.data.message);
    }
}