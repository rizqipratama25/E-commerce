import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/auth/useLogin";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { getUser } from "../../utils/authStorage";

const LoginPage = () => {
    const navigate = useNavigate();
    const { mutate: login, isPending } = useLogin();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        login(
            {
                email: form.email,
                password: form.password,
            },
            {
                onSuccess: () => {
                    toast.success("Login Success!");
                    const user = getUser();

                    if (user?.role === 'Admin') {
                        navigate('/admin');
                    } else if (user?.role === 'Partner') {
                        navigate('/partner');
                    } else {
                        navigate('/');
                    }
                },
                onError: (error: any) => {
                    const message = error.response?.data?.message ?? error.message ?? "Email atau password salah";
                    toast.error(message);
                }
            }
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border rounded-lg p-2"
                        value={form.email}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border rounded-lg p-2"
                        value={form.password}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, password: e.target.value }))
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60 cursor-pointer"
                    >
                        {isPending ? "Masuk..." : "Masuk"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage