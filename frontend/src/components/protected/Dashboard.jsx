import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../axiosInstance'

// Report history. React Query handles the fetch, caching, and loading state.
const fetchReports = async () => {
    const response = await axiosInstance.get('/reports/')
    return response.data.results || response.data
}

const Dashboard = () => {
    const queryClient = useQueryClient()

    const { data: reports, isLoading, isError } = useQuery({
        queryKey: ['reports'],
        queryFn: fetchReports,
    })

    // Delete a report, then refresh the list from the server
    const deleteReport = useMutation({
        mutationFn: (id) => axiosInstance.delete(`/reports/${id}/`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
    })

    const handleDelete = (e, id, name) => {
        // The card is wrapped in a link, so stop the click from opening the report
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm(`Delete the research report for ${name}?`)) {
            deleteReport.mutate(id)
        }
    }

    if (isLoading) {
        return <div className="text-light text-center p-5">Loading your reports...</div>
    }

    if (isError) {
        return <div className="text-light text-center p-5">Could not load reports. Please refresh.</div>
    }

    if (!reports || reports.length === 0) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 bg-light-dark p-5 rounded text-center">
                        <h3 className="text-light">No reports yet</h3>
                        <p className="text-light">
                            You haven't researched any companies yet. Run your first
                            research to see it here.
                        </p>
                        <Link to="/research">
                            <button className="btn btn-info btn-lg mt-3">Research a Company</button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-4">
            <h4 className="text-info mb-4">Your Research History</h4>
            <div className="row">
                {reports.map((report) => (
                    <div key={report.id} className="col-md-6 mb-3">
                        <Link to={`/reports/${report.id}`} className="text-decoration-none">
                            <div className="bg-light-dark p-4 rounded report-card">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="text-light mb-0">{report.company.name}</h5>
                                    <span className={report.verdict === 'INVEST' ? 'badge-invest' : 'badge-pass'}>
                                        {report.verdict === 'INVEST' ? 'Invest' : 'Pass'}
                                    </span>
                                </div>
                                <p className="text-light small mt-2 mb-0">
                                    Score: {report.overall_score}/100
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <p className="text-muted small mb-0">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </p>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={(e) => handleDelete(e, report.id, report.company.name)}
                                        disabled={deleteReport.isPending}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard
