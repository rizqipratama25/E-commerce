interface Props {
    title: string;
    description: string;
    children?: React.ReactNode;
}

const TitleRoutesAdminPartner = ({title, description, children} : Props) => {
    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <p className="text-gray-600">{description}</p>
                {children}
            </div>
        </>
    )
}

export default TitleRoutesAdminPartner