import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import DebouncedSearchCombobox from "../../../components/DebouncedSeach/DebouncedSearchCombobox";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const AddResource = () => {
    const { 
        register, 
        handleSubmit, 
        setValue,
        reset,
        formState: { errors, isSubmitting } 
    } = useForm({
        defaultValues: {
            vote: 0
        }
    });
    
    const [courseCodes, setCourseCodes] = useState([]);
    const [selectedCode, setSelectedCode] = useState('');
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const axiosPublic = useAxiosPublic();

    const onSubmit = async (data) => {
        try {
            const resource = {
                course_code: data.course_code,
                description: data.description,
                publishers_name: data.publishers_name || null,
                type: data.type,
                link: data.link,
                vote: 0
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
            }
        } catch (error) {
            console.error('Error adding resource:', error);
            
            let errorMessage = 'Failed to add resource';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
                if (error.response.data.error) {
                    errorMessage += `: ${error.response.data.error}`;
                }
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
            });
        }
    };

    useEffect(() => {
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
    }, [axiosPublic]);

    useEffect(() => {
        setValue("course_code", selectedCode, { shouldValidate: true });
    }, [selectedCode, setValue]);

    return (
        <div className="max-w-3xl mx-auto p-6 rounded-xl shadow-md">
            <SectionTitle
                heading="Add Resource"
                subHeading="Help others with your Resources 😊"
            />
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
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
                </div>

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
                    <label className="block mb-1 font-semibold">Paste Your Link *</label>
                    <input 
                        {...register("link", { 
                            required: "Link is required",
                            pattern: {
                                value: /^(https?:\/\/).+/,
                                message: "Link must start with http:// or https://"
                            }
                        })} 
                        className="w-full border p-2 rounded"
                        placeholder="https://example.com/resource"
                        type="url"
                    />
                    {errors.link && (
                        <p className="text-red-500 text-sm mt-1">{errors.link.message}</p>
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