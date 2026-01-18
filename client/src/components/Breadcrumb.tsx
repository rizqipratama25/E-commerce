import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type BreadcrumbItem = {
    id: number;
    name: string;
    slug: string;
    path: string;
    level: string;
};

export const CategoryBreadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
    if (!items?.length) return null;

    return (
        <div className="text-sm flex items-center flex-wrap">
            {items.map((item, idx) => (
                <div key={item.id} className="flex items-center">
                    {idx > 0 && (<ChevronRight className="mx-2 text-[#F26A24] w-3.5 h-3.5" />)}
                    <Link
                        to={`/c/${item.path}`}
                        className="text-[#F26A24] hover:underline font-semibold"
                    >
                        {item.name}
                    </Link>
                </div>
            ))}
        </div>
    );
}