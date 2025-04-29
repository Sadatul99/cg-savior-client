import { useEffect } from "react";
import { useState } from "react";


const useResources = () => {

    const [resources, setResource] = useState([])
    // const [loading, setLoading] = useState(true)

    useEffect(() =>{
        fetch('http://localhost:5000/resources')
        .then(res => res.json())
        .then(data => {
            setResource(data)
            // setLoading(false)
        })
    },[])
    
    return [resources]
};

export default useResources;