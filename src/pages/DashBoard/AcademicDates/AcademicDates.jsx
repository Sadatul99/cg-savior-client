import { useState } from "react";
import { FaExternalLinkAlt, FaImage } from "react-icons/fa";

const AcademicDates = () => {
    const [imageFailed, setImageFailed] = useState(false);
    const calendarImageUrl = "https://www.bracu.ac.bd/sites/default/files/uploads/2025/12/30/Year%20Planner%202026_up.png";
    const academicDatesUrl = "https://www.bracu.ac.bd/academic-dates";

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Academic Calendar</h2>
                    <p className="mt-2 text-sm text-base-content/70">
                        Official BRAC University academic dates.
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
                        href={calendarImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <FaImage />
                        Open Image
                    </a>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
                {imageFailed ? (
                    <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-8 text-center">
                        <p className="text-lg font-semibold">Could not load the calendar image.</p>
                        <a
                            href={academicDatesUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm gap-2"
                        >
                            <FaExternalLinkAlt />
                            View on BRACU
                        </a>
                    </div>
                ) : (
                    <img
                        src={calendarImageUrl}
                        alt="BRAC University academic calendar 2026"
                        className="block w-full bg-white object-contain"
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                    />
                )}
            </div>
        </div>
    );
};

export default AcademicDates;
