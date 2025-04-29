import React from 'react';

const ResourceTab = ({ items }) => {
    return (
        <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full table-auto border ">
                <thead className="">
                    <tr>
                        <th className="px-4 py-3 border">Course Code</th>
                        <th className="px-4 py-3 border">Description</th>
                        <th className="px-4 py-3 border ">Publisher</th>
                        <th className="px-4 py-3 border ">Type</th>
                        <th className="px-4 py-3 border ">Link</th>
                        <th className="px-4 py-3 border ">Votes</th>
                    </tr>
                </thead>

                <tbody >
                    {items.map((res, index) => (
                        <tr
                            key={index}
                            className=""
                        >
                            <td className="px-4 py-2 border ">{res.course_code}</td>
                            <td className="px-4 py-2 border">{res.description}</td>
                            <td className="px-4 py-2 border">{res.publishers_name}</td>
                            <td className="px-4 py-2 border capitalize">{res.type}</td>
                            <td className="px-4 py-2 border ">
                                <a
                                    href={res.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                    View
                                </a>
                            </td>
                            <td className="px-4 py-2 border  text-center">{res.vote}</td>
                        </tr>
                    ))}
                </tbody>


            </table>
        </div>

    );
};

export default ResourceTab;