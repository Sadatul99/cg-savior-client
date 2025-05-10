import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './useAxiosSecure'; // Assuming you have this

const useResources = () => {
  const axiosSecure = useAxiosSecure();

  const { data: resources = [], refetch, isLoading, isError } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const res = await axiosSecure.get('/resources');
      return res.data;
    }
  });

  return [resources, refetch, isLoading, isError];
};

export default useResources;
