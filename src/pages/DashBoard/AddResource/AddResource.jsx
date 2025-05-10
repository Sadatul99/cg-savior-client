import SectionTitle from "../../../components/SectionTitle/SectionTitle"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import DebouncedSearchCombobox from "../../../components/DebouncedSeach/DebouncedSearchCombobox"
// import useAxiosSecure from "../../../hooks/useAxiosSecure"
import Swal from "sweetalert2"
import useAxiosPublic from "../../../hooks/useAxiosPublic"

const AddResource = () => {
    const { register, handleSubmit, setValue,reset, formState: { errors } } = useForm()
    const [courseCodes, setCourseCodes] = useState([])
    const [selectedCode, setSelectedCode] = useState('')
    // const axiosSecure = useAxiosSecure()
    const axiosPublic = useAxiosPublic()

    const onSubmit = async (data) => {
        const resource = {
            course_code: data.course_code ,
            description: data.description ,
            publishers_name: data.publishers_name ,
            type: data.type ,
            link: data.link ,
            vote:  0
        }
        console.log(data)

        const resourceRes = await axiosPublic.post('/resources', resource);
            if(resourceRes.data.insertedId){
                // show success popup
                reset();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: `Resource is added successfully.`,
                    showConfirmButton: false,
                    timer: 1500
                  });
    }
}

    useEffect(() => {
        // Replace this with API call
        setCourseCodes(["CSE110", "CSE111", "CSE220", "CSE221", "CSE230", "CSE250"])
    }, [])

    useEffect(() => {
        setValue("course_code", selectedCode)
    }, [selectedCode, setValue])

    return (
        <div>
            <SectionTitle
                heading="Add Resource"
                subHeading="Help others with your Resources 😊"
            />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
                <div>
                    <label className="block mb-1 font-semibold">Course Code</label>
                    <DebouncedSearchCombobox
                        value={selectedCode}
                        onChange={setSelectedCode}
                        allCourses={courseCodes}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Resource Title</label>
                    <input {...register("description")} className="w-full border p-2 rounded" />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Paste Your Link</label>
                    <input {...register("link")} className="w-full border p-2 rounded" />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Publisher's Name</label>
                    <input {...register("publishers_name")} className="w-full border p-2 rounded" />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Resource Type</label>
                    <select {...register("type")} className="w-full border p-2 rounded">
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
                </div>

                <input type="submit" value="Submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" />
            </form>
        </div>
    )
}


export default AddResource
