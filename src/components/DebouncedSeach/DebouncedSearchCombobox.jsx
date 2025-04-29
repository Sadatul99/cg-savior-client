import { Combobox } from '@headlessui/react'
import { useEffect, useState } from 'react'

const DebouncedSearchCombobox = ({ value, onChange, allCourses }) => {
    const [query, setQuery] = useState('')
    const [filtered, setFiltered] = useState([])

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!query) {
                setFiltered(allCourses)
            } else {
                setFiltered(
                    allCourses.filter(course =>
                        course.toLowerCase().includes(query.toLowerCase())
                    )
                )
            }
        }, 200)

        return () => clearTimeout(timeout)
    }, [query, allCourses])

    return (
        <div className="w-full">
            <Combobox value={value} onChange={onChange}>
                <div className="relative">
                    <Combobox.Input
                        className="w-full border p-2 rounded"
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={(v) => v}
                        placeholder="Search course code"
                    />
                    <Combobox.Options className="absolute z-10 bg-white w-full mt-1 max-h-60 overflow-auto border rounded shadow">
                        {filtered.map((course) => (
                            <Combobox.Option
                                key={course}
                                value={course}
                                className={({ active }) =>
                                    `px-4 py-2 cursor-pointer ${
                                        active ? 'bg-blue-100' : ''
                                    }`
                                }
                            >
                                {course}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </div>
            </Combobox>
        </div>
    )
}

export default DebouncedSearchCombobox
