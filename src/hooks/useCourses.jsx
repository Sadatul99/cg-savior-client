import { useQuery } from '@tanstack/react-query';

const useCourses = () => {
  const { data: courses = [], refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/courses');
      return res.json();
    },
  });

  return [courses, refetch];
};

export default useCourses;
