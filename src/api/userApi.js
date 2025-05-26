import api from './axiosConfig';

export const updateUserInfo = async (name, imageFile) => {
    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await api.put('/users/me', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};