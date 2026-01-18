import { useNavigate } from "react-router-dom";
import { useRegister } from "../../hooks/auth/useRegister";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { getUser } from "../../utils/authStorage";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { mutate: register, isPending } = useRegister();

  const [form, setForm] = useState({
    username: "",
    fullname: "",
    photo_profile: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "Buyer"
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    register(
      {
        username: form.username,
        fullname: form.fullname,
        phone: form.phone,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        role: "Buyer"
      },
      {
        onSuccess: () => {
          toast.success("Register Success!");
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
          const message = error.response?.data?.message ?? error.message;
          toast.error(message);
        }
      }
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Daftar</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full border rounded-lg p-2"
            value={form.username}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, username: e.target.value }))
            }
            required
          />

          <input
            type="text"
            placeholder="Nama Lengkap"
            className="w-full border rounded-lg p-2"
            value={form.fullname}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fullname: e.target.value }))
            }
            required
          />

          <input
            type="text"
            placeholder="Nomor Telepon"
            className="w-full border rounded-lg p-2"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            required
          />

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

          <input
            type="password"
            placeholder="Konfirmasi Password"
            className="w-full border rounded-lg p-2"
            value={form.password_confirmation}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password_confirmation: e.target.value }))
            }
            required
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#F26A24] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {isPending ? "Daftar..." : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage