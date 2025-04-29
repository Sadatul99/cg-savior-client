import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useBookmark = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const { refetch, data: bookmarks = [] } = useQuery({
    enabled: !!user, // only run when user exists
    queryKey: ["bookmark", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/bookmarks?email=${user.email}`);
      return res.data;
    },
  });

  return [bookmarks, refetch];
};

export default useBookmark;
