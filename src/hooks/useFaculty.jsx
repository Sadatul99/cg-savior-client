
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const useFaculty = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { data: isFaculty, isPending: isFacultyLoading } = useQuery({
        queryKey: [user?.email, 'isFaculty'],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/faculty/${user.email}`);
            console.log(res.data);
            return res.data?.faculty;
        }
    })
    return [isFaculty, isFacultyLoading]
};

export default useFaculty;