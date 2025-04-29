import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import { useForm } from "react-hook-form";

const AddCourse = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    const course = {
      course_code: data.course_code,
      course_title: data.course_title,
      pre_requisite: data.pre_requisite,
      // soft_pre_requisite: 
    }
    reset();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <SectionTitle heading="Add Course" subHeading="What's new" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <div>
          <label className="block font-medium mb-1">Course Code</label>
          <input
            type="text"
            {...register("course_code", { required: "Course Code is required" })}
            className="input input-bordered w-full"
          />
          {errors.course_code && <p className="text-red-500 text-sm mt-1">{errors.course_code.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Course Title</label>
          <input
            type="text"
            {...register("course_title", { required: "Course Title is required" })}
            className="input input-bordered w-full"
          />
          {errors.course_title && <p className="text-red-500 text-sm mt-1">{errors.course_title.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Pre-requisite</label>
          <input
            type="text"
            {...register("pre_requisite")}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Soft Pre-requisite</label>
          <input
            type="text"
            {...register("soft_pre_requisite")}
            className="input input-bordered w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Lab</label>
            <select {...register("lab")} className="select select-bordered w-full">
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Credit</label>
            <input
              type="number"
              step="0.5"
              {...register("credit", { required: "Credit is required" })}
              className="input input-bordered w-full"
            />
            {errors.credit && <p className="text-red-500 text-sm mt-1">{errors.credit.message}</p>}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Course Description</label>
          <textarea
            {...register("course_description", { required: "Description is required" })}
            rows="5"
            className="textarea textarea-bordered w-full"
          ></textarea>
          {errors.course_description && <p className="text-red-500 text-sm mt-1">{errors.course_description.message}</p>}
        </div>

        <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Course
          </button>


      </form>
    </div>
  );
};

export default AddCourse;
