
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useNavigate } from "react-router-dom";


const SocialLogin = () => {
    const { googleSignIn } = useAuth();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    const handleGoogleSignIn = () => {
        googleSignIn()
            .then(result => {
                console.log(result.user);
                const userInfo = {
                    email: result.user?.email,
                    name: result.user?.displayName
                }
                axiosPublic.post('/users', userInfo)
                    .then(res => {
                        console.log(res.data);
                        navigate('/dashboard');
                    })
            })
    }

    return (
        <div className="p-8">
            <div className="divider"></div>
            <div>
                <button
                    onClick={handleGoogleSignIn}
                    type="button"
                    className="w-full mt-4 flex items-center justify-center gap-2 border p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="h-5 w-5" />
                    <span>Login/Signup with Google</span>
                </button>
            </div>
        </div>
    );
};

export default SocialLogin;