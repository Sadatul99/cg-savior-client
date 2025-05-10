import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const AddClassMaterial = () => {
  const { code: class_code } = useParams();
  const axiosPublic = useAxiosPublic();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const classResource = {
      class_code,
      course_code: data.course_code,
      description: data.description,
      type: data.type,
      link: data.link,
    };

    try {
      const res = await axiosPublic.post("/class-resources", classResource);

      if (res.data.insertedId) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Class resource added successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
        reset();
      }
    } catch (err) {
      console.error("Error adding class resource:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong while adding the resource!",
      });
    }
  };

  return (
    <div>
      <SectionTitle
        heading={`Add Material for ${class_code}`}
        subHeading="Add helpful class-specific materials"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
        <div>
          <label className="block mb-1 font-semibold">Course Code</label>
          <input
            {...register("course_code", { required: true })}
            placeholder="e.g., CSE110"
            className="w-full border p-2 rounded"
          />
          {errors.course_code && <p className="text-red-500">Course code is required</p>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Resource Title</label>
          <input
            {...register("description", { required: true })}
            className="w-full border p-2 rounded"
          />
          {errors.description && <p className="text-red-500">Description is required</p>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Paste Your Link</label>
          <input
            {...register("link", { required: true })}
            className="w-full border p-2 rounded"
          />
          {errors.link && <p className="text-red-500">Link is required</p>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Resource Type</label>
          <select {...register("type", { required: true })} className="w-full border p-2 rounded">
            <option value="" disabled>Select Type</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
            <option value="slide">Slide</option>
            <option value="notes">Notes</option>
            <option value="practice sheet">Practice Sheet</option>
            <option value="others">Others</option>
          </select>
          {errors.type && <p className="text-red-500">Type is required</p>}
        </div>

        <input
          type="submit"
          value="Submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        />
      </form>
    </div>
  );
};

export default AddClassMaterial;
