import axios from 'axios';

const axiosPublic = axios.create({
    baseURL: 'https://cg-savior-server.onrender.com'
})

const useAxiosPublic = () => {
    return axiosPublic
};

export default useAxiosPublic;
