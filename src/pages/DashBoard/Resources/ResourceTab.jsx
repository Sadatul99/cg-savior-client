import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const ResourceTab = ({ items, refetch, isAdmin }) => {
    const axiosSecure = useAxiosSecure();
    const [votingResourceId, setVotingResourceId] = useState(null);

    const handleVote = async (id, direction) => {
        setVotingResourceId(id);
        try {
            await axiosSecure.patch(`/resources/${id}/vote`, { direction });
            refetch();
        } catch (err) {
            console.error('Failed to submit resource vote:', err);
            Swal.fire('Error!', err.response?.data?.message || 'Failed to submit vote.', 'error');
        } finally {
            setVotingResourceId(null);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
              title: 'Are you sure?',
              text: `Delete resource?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, delete it!',
            });
        
            if (confirm.isConfirmed) {
              try {
                await axiosSecure.delete(`/resources/${id}`);
                refetch();
                Swal.fire('Deleted!', 'Resource has been deleted.', 'success');
              } catch (err) {
                console.error(err);
                Swal.fire('Error!', err.response?.data?.message || 'Failed to delete resource.', 'error');
              }
            }
          };
    

    return (
        <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full table-auto border ">
                <thead>
                    <tr>
                        <th className="px-4 py-3 border">Course Code</th>
                        <th className="px-4 py-3 border">Description</th>
                        <th className="px-4 py-3 border">Publisher</th>
                        <th className="px-4 py-3 border">Type</th>
                        <th className="px-4 py-3 border">Link</th>
                        <th className="px-4 py-3 border">Votes</th>
                        {isAdmin && <th className="px-4 py-3 border">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((res, index) => (
                        <tr key={index}>
                            <td className="px-4 py-2 border">{res.course_code}</td>
                            <td className="px-4 py-2 border">{res.description}</td>
                            <td className="px-4 py-2 border">{res.publishers_name}</td>
                            <td className="px-4 py-2 border capitalize">{res.type}</td>
                            <td className="px-4 py-2 border">
                                <a
                                    href={res.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline hover:text-blue-800"
                                >
                                    View
                                </a>
                            </td>
                            <td className="px-4 py-2 border text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleVote(res._id, 1)}
                                        disabled={votingResourceId === res._id}
                                        className="text-lg transition-transform hover:scale-125 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Like resource"
                                        aria-label="Like resource"
                                    >
                                        👍
                                    </button>
                                    <span className="min-w-6 font-semibold">{res.vote ?? 0}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleVote(res._id, -1)}
                                        disabled={votingResourceId === res._id}
                                        className="text-lg transition-transform hover:scale-125 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Dislike resource"
                                        aria-label="Dislike resource"
                                    >
                                        👎
                                    </button>
                                </div>
                            </td>
                            {isAdmin && (
                                <td className="px-4 py-2 border text-center">
                                    <button
                                        onClick={() => handleDelete(res._id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete Resource"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResourceTab;
