import { Bell } from "lucide-react"

interface Props {
    fullname: string;
    email: string;
}

const HeaderAdminPartner = ({fullname, email}: Props) => {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <h1 className='text-xl font-bold text-[#F26A24]'>Halo, {fullname}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#F26A24] rounded-full"></span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F26A24] rounded-full flex items-center justify-center text-white font-semibold">
                            A
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold">{fullname}</p>
                            <p className="text-xs text-gray-500">{email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default HeaderAdminPartner