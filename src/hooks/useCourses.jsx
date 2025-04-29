import { useEffect } from "react";
import { useState } from "react";


const useCourses = () => {

    const [courses, setCourse] = useState([])
    // const [loading, setLoading] = useState(true)

    useEffect(() =>{
        fetch('http://localhost:5000/courses')
        .then(res => res.json())
        .then(data => {
            setCourse(data)
            // setLoading(false)
        })
    },[])
    
    return [courses]
};

export default useCourses;