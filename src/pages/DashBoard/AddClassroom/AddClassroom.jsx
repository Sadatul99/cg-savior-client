import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import { Controller, useForm } from "react-hook-form";
// import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useCourses from "../../../hooks/useCourses";
import Swal from "sweetalert2";
import Select from "react-select";
import useAuth from "../../../hooks/useAuth";
import useAxiosPublic from "../../../hooks/useAxiosPublic";



const AddClassroom = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError
  } = useForm();

  const {user} = useAuth();

  const axiosPublic = useAxiosPublic()
  const [courses] = useCourses(); // ✅ using your custom hook

  // Map course options for react-select
  const courseOptions = courses.map((course) => ({
    value: course.course_code,
    label: `${course.course_code} - ${course.course_title}`
  }));

  const onSubmit = async (data) => {
    const classroom = {
      class_code: data.class_code.trim().toLowerCase(),
      course_code: data.course_code.value, // because of react-select
      email: user.email,
      faculty_initial: data.faculty_initial,
      section: data.section,
      semester: data.semester
    };
  
    try {
      // Step 1: Check if class_code already exists
      // const checkRes = await axiosPublic.get(`/classroom/check-class-code/${classroom.class_code}`);
      // if (checkRes.data.exists) {
      //   //  If exists, set form error
      //   setError("class_code", {
      //     type: "manual",
      //     message: "This Class Code already exists"
      //   });
      //   return;
      //}
  
      //  Step 2: If not exists, create classroom
      const res = await axiosPublic.post("/classroom", classroom);
      if (res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Classroom Created",
          showConfirmButton: false,
          timer: 1500
        });
        reset();
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <SectionTitle heading="Create Classroom" subHeading="" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/*  Searchable Course Dropdown */}
        <div>
          <label className="block font-medium mb-1">Course Code</label>
          <Controller
            name="course_code"
            control={control}
            rules={{ required: "Course Code is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={courseOptions}
                placeholder="Search and select a course"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            )}
          />
          {errors.course_code && (
            <p className="text-red-500 text-sm mt-1">{errors.course_code.message}</p>
          )}
        </div>

        {/* Other Inputs */}
        <div>
          <label className="block font-medium mb-1">Class Code</label>
          <input
            type="text"
            {...register("class_code", { required: "Class Code is required" })}
            className="input input-bordered w-full"
          />
          {errors.class_code && <p className="text-red-500 text-sm mt-1">{errors.class_code.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Faculty Initial</label>
          <input
            type="text"
            {...register("faculty_initial", { required: "Faculty initial is required" })}
            className="input input-bordered w-full"
          />
          {errors.faculty_initial && <p className="text-red-500 text-sm mt-1">{errors.faculty_initial.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Semester</label>
          <input
            type="text"
            {...register("semester")}
            className="input input-bordered w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Section</label>
            <input
              type="number"
              step="1"
              {...register("section", { required: "Section is required" })}
              className="input input-bordered w-full"
            />
            {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default AddClassroom;
