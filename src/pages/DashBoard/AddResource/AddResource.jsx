import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import DebouncedSearchCombobox from "../../../components/DebouncedSeach/DebouncedSearchCombobox";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import useAuth from "../../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const AddResource = ({ courseCode, onSuccess }) => {
    const { 
        register, 
        handleSubmit, 
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting } 
    } = useForm({
        defaultValues: {
            vote: 0,
            submissionFormat: ""
        }
    });
    
    const [courseCodes, setCourseCodes] = useState([]);
    const [selectedCode, setSelectedCode] = useState(courseCode || '');
    const [isLoadingCourses, setIsLoadingCourses] = useState(!courseCode);
    const axiosPublic = useAxiosPublic();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const selectedType = watch("type");
    const submissionFormat = selectedType === "youtube" ? "link" : watch("submissionFormat");

    const onSubmit = async (data) => {
        try {
            let resourceLink = data.link;
            let uploadedFileName = null;
            let driveFileId = null;

            if (data.type === "youtube") {
                resourceLink = data.link;
            } else if (data.submissionFormat === "image" || data.submissionFormat === "file") {
                const selectedFile = data.resourceFile?.[0];

                if (!selectedFile) {
                    throw new Error("Please choose a file before submitting.");
                }

                if (data.submissionFormat === "image" && !selectedFile.type.startsWith("image/")) {
                    throw new Error("Please choose a valid image file.");
                }

                const MAX_FILE_SIZE = 100 * 1024 * 1024;
                if (selectedFile.size > MAX_FILE_SIZE) {
                    throw new Error("File size exceeds the 100MB limit. Please upload a smaller file or host it externally (e.g., on Google Drive) and paste the link here.");
                }

                const formData = new FormData();
                formData.append("file", selectedFile);

                const uploadRes = await axiosPublic.post("/resources/upload-to-drive", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                resourceLink = uploadRes.data.link;
                uploadedFileName = selectedFile.name;
                driveFileId = uploadRes.data.id;
            }

            const resource = {
                course_code: courseCode || data.course_code,
                description: data.description,
                publishers_name: data.publishers_name || null,
                type: data.type,
                link: resourceLink,
                submission_format: data.type === "youtube" ? "link" : data.submissionFormat,
                uploaded_file_name: uploadedFileName,
                drive_file_id: driveFileId,
                vote: 0,
                uploader_email: user?.email || null,
                uploader_name: user?.displayName || null,
            };

            const resourceRes = await axiosPublic.post('/resources', resource);
            
            if (resourceRes.data.insertedId) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Resource added successfully!",
                    showConfirmButton: false,
                    timer: 1500
                });
                reset();
                setSelectedCode(courseCode || '');
                await queryClient.invalidateQueries({ queryKey: ['resources'] });
                onSuccess?.();
            }
        } catch (error) {
            console.error('Error adding resource:', error);
            
            let errorMessage = 'Failed to add resource';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
                if (error.response.data.error) {
                    errorMessage += `: ${error.response.data.error}`;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
            });
        }
    };

    useEffect(() => {
        if (courseCode) return;
        // Fetch actual course codes from API
        const fetchCourseCodes = async () => {
            try {
                const response = await axiosPublic.get('/courses');
                const codes = response.data.map(course => course.course_code);
                setCourseCodes(codes);
            } catch (error) {
                console.error('Error fetching course codes:', error);
                // Fallback to default codes if API fails
                setCourseCodes(["CSE110", "CSE111", "CSE220", "CSE221", "CSE230", "CSE250"]);
            } finally {
                setIsLoadingCourses(false);
            }
        };

        fetchCourseCodes();
    }, [axiosPublic, courseCode]);

    useEffect(() => {
        setValue("course_code", selectedCode, { shouldValidate: true });
    }, [selectedCode, setValue]);

    useEffect(() => {
        if (selectedType === "youtube") {
            setValue("submissionFormat", "link", { shouldValidate: true });
        } else {
            setValue("link", "");
            setValue("resourceFile", null);
        }
    }, [selectedType, setValue]);

    useEffect(() => {
        if (submissionFormat === "link") {
            setValue("resourceFile", null);
        } else if (submissionFormat === "image" || submissionFormat === "file") {
            setValue("link", "");
        }
    }, [submissionFormat, setValue]);

    return (
        <div className="max-w-3xl mx-auto p-6 rounded-xl shadow-md">
            <SectionTitle
                heading="Add Resource"
                subHeading="Help others with your Resources 😊"
            />
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!courseCode && <div>
                    <label className="block mb-1 font-semibold">Course Code *</label>
                    {isLoadingCourses ? (
                        <div className="w-full border p-2 rounded bg-gray-100 animate-pulse">
                            Loading courses...
                        </div>
                    ) : (
                        <>
                            <DebouncedSearchCombobox
                                value={selectedCode}
                                onChange={setSelectedCode}
                                allCourses={courseCodes}
                                required
                            />
                            {errors.course_code && (
                                <p className="text-red-500 text-sm mt-1">{errors.course_code.message}</p>
                            )}
                        </>
                    )}
                </div>}

                <div>
                    <label className="block mb-1 font-semibold">Resource Title *</label>
                    <input 
                        {...register("description", { 
                            required: "Resource title is required",
                            minLength: {
                                value: 5,
                                message: "Title must be at least 5 characters"
                            }
                        })} 
                        className="w-full border p-2 rounded"
                        placeholder="Enter a descriptive title"
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Publisher's Name</label>
                    <input 
                        {...register("publishers_name")} 
                        className="w-full border p-2 rounded"
                        placeholder="Your name (optional)"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Resource Type *</label>
                    <select 
                        {...register("type", { required: "Please select a resource type" })} 
                        className="w-full border p-2 rounded"
                    >
                        <option value="" disabled>Select Type</option>
                        <option value="youtube">Playlist</option>
                        <option value="mid">Mid</option>
                        <option value="final">Final</option>
                        <option value="slides">Slides</option>
                        <option value="notes">Notes</option>
                        <option value="practicesheet">Practice Sheet</option>
                        <option value="book">Book</option>
                        <option value="others">Others</option>
                    </select>
                    {errors.type && (
                        <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                    )}
                </div>

                {selectedType && selectedType !== "youtube" && (
                    <div>
                        <label className="block mb-2 font-semibold">Submission Format *</label>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {[
                                { value: "image", label: "Image" },
                                { value: "file", label: "File" },
                                { value: "link", label: "Link" },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`border rounded p-3 cursor-pointer text-center ${
                                        submissionFormat === option.value ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        value={option.value}
                                        className="sr-only"
                                        {...register("submissionFormat", {
                                            required: selectedType !== "youtube" ? "Please select a submission format" : false
                                        })}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                        {errors.submissionFormat && (
                            <p className="text-red-500 text-sm mt-1">{errors.submissionFormat.message}</p>
                        )}
                    </div>
                )}

                {(selectedType === "youtube" || submissionFormat === "link") && (
                    <div>
                        <label className="block mb-1 font-semibold">Paste Your Link *</label>
                        <input 
                            {...register("link", { 
                                required: (selectedType === "youtube" || submissionFormat === "link") ? "Link is required" : false,
                                pattern: {
                                    value: /^(https?:\/\/).+/,
                                    message: "Link must start with http:// or https://"
                                }
                            })} 
                            className="w-full border p-2 rounded"
                            placeholder={selectedType === "youtube" ? "https://youtube.com/playlist?list=..." : "https://example.com/resource"}
                            type="url"
                        />
                        {errors.link && (
                            <p className="text-red-500 text-sm mt-1">{errors.link.message}</p>
                        )}
                    </div>
                )}

                {(submissionFormat === "image" || submissionFormat === "file") && (
                    <div>
                        <label className="block mb-1 font-semibold">
                            {submissionFormat === "image" ? "Choose Image *" : "Choose File *"}
                        </label>
                        <input
                            type="file"
                            accept={submissionFormat === "image" ? "image/*" : undefined}
                            {...register("resourceFile", {
                                required: "Please choose a file before submitting",
                                validate: {
                                    lessThanMax: (files) => 
                                        !files[0] || 
                                        files[0].size <= 100 * 1024 * 1024 || 
                                        'File size exceeds the 100MB limit. Please upload a smaller file or host it externally (e.g., on Google Drive) and paste the link here.'
                                }
                            })}
                            className="w-full border p-2 rounded bg-white"
                        />
                        <p className="text-gray-500 text-xs mt-1">Max file size: 100MB</p>
                        {errors.resourceFile && (
                            <p className="text-red-500 text-sm mt-1">{errors.resourceFile.message}</p>
                        )}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Resource'}
                </button>
            </form>
        </div>
    );
};

export default AddResource;
