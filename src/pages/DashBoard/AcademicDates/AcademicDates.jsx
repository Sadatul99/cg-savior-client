import { FaDownload, FaExternalLinkAlt } from "react-icons/fa";

const AcademicDates = () => {
    const academicDatesUrl = "https://www.bracu.ac.bd/academic-dates";
    const calendarPdfUrl = "https://www.bracu.ac.bd/sites/default/files/uploads/2025/12/30/Year%20Planner%202026_up.pdf";
    const calendarImageUrl = "https://www.bracu.ac.bd/sites/default/files/uploads/2025/12/30/Year%20Planner%202026_up.png";

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Academic Dates</h2>
                    <p className="mt-2 text-sm text-base-content/70">
                        View the official BRAC University academic calendar and download the PDF.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <a
                        href={academicDatesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm gap-2"
                    >
                        <FaExternalLinkAlt />
                        Source
                    </a>
                    <a
                        href={calendarPdfUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <FaDownload />
                        Download PDF
                    </a>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
                <img
                    src={calendarImageUrl}
                    alt="BRAC University academic calendar 2026"
                    className="block w-full bg-white object-contain"
                    loading="lazy"
                />
            </div>
        </div>
    );
};

export default AcademicDates;
