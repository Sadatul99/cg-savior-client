import { useContext } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import SocialLogin from "../../components/SocialLogin/SocialLogin";


const SignUp = () => {
    // copy paste from react hook form
    const { register, handleSubmit, reset, formState: { errors }, } = useForm()

    const axiosPublic = useAxiosPublic()
    const { createUser, updateUserProfile } = useContext(AuthContext)
    const navigate = useNavigate();

    const onSubmit = data => {
        // console.log(data);
        createUser(data.email, data.password)
            .then(result => {
                const loggedUser = result.user;
                console.log(loggedUser);
                updateUserProfile(data.name)
                    .then(() => {
                        const userInfo = {
                            name: data.name,
                            email: data.email
                        }
                        axiosPublic.post('/users', userInfo)
                            .then(res => {
                                if (res.data.insertedId) {
                                    reset();
                                    Swal.fire({
                                        position: 'top-end',
                                        icon: 'success',
                                        title: 'User created successfully.',
                                        showConfirmButton: false,
                                        timer: 1500
                                    });
                                    navigate('/dashboard');
                                }
                            })


                    })
                    .catch(error => console.log(error))
            })
    };



    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
                    <h2 className="text-2xl font-semibold text-center text-blue-600">Sign Up</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">


                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Name</label>
                            <input
                                type="text"
                                {...register("name", { required: true })}
                                className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter your name"
                            />
                            {errors.name && <span className="text-red-600">Name is required</span>}
                        </div>


                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Email</label>
                            <input
                                type="email"
                                {...register("email", { required: true })}
                                className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter your email"
                            />
                            {errors.email && <span className="text-red-600">Email is required</span>}
                        </div>


                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">Password</label>
                            <input  // Regex validation module 66-6
                                type="password"
                                {...register("password", { required: true, minLength: 6, maxLength: 20 })} // length 6 to 20
                                className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter your password"
                            />
                            {/* error handling for specific type of error */}
                            {errors.password?.type === 'required' && <span className="text-red-600">Password is required.</span>}
                            {errors.password?.type === 'minLength' && <span className="text-red-600">Password must be at least 6 characters</span>}
                            {errors.password?.type === 'maxLength' && <span className="text-red-600">Password must be less than 20 characters</span>}
                        </div>

                        {/* <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Re-enter Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm your password"
              required
            />
          </div> */}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Sign Up
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2">
                            <div className="w-full h-px bg-gray-300"></div>
                            <span className="text-sm text-gray-500">OR</span>
                            <div className="w-full h-px bg-gray-300"></div>
                        </div>

                        <SocialLogin></SocialLogin>

                        <p className="mt-4 text-sm text-center text-gray-500">
                            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SignUp;