import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import axiosInstance from '../../axiosInstance'
import { exportReportToPdf } from '../../utils/exportPdf'

// Full report: scorecard, verdict, the three analysis sections, and PDF export.
const ReportView = () => {
    const { id } = useParams()
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axiosInstance.get(`/reports/${id}/`)
                setReport(response.data)
            } catch {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [id])

    if (loading) return <div className="text-light text-center p-5">Loading report...</div>
    if (error || !report) return <div className="text-light text-center p-5">Report not found.</div>

    const score = report.score || {}
    const isInvest = report.verdict === 'INVEST'

    // Recharts wants an array of {name, value}. Risk is shown as-is (higher = riskier).
    const chartData = [
        { name: 'Business', value: score.business_score },
        { name: 'Growth', value: score.growth_score },
        { name: 'Risk', value: score.risk_score },
    ]
    const barColors = ['#17a2b8', '#28a745', '#dc3545']

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Link to="/dashboard" className="text-info text-decoration-none">
                    &larr; Back to history
                </Link>
                <button className="btn btn-outline-info" onClick={() => exportReportToPdf(report)}>
                    Export PDF
                </button>
            </div>

            {/* Header: company + verdict */}
            <div className="bg-light-dark p-4 rounded mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="text-light mb-1">{report.company.name}</h3>
                        <p className="text-muted mb-0">{report.company.sector || 'Unspecified sector'}</p>
                    </div>
                    <div className="text-end">
                        <span className={isInvest ? 'badge-invest' : 'badge-pass'}>
                            {isInvest ? 'Invest' : 'Pass'}
                        </span>
                        <h2 className="text-light mt-2 mb-0">{score.overall_score}/100</h2>
                    </div>
                </div>
                <p className="text-light mt-3 mb-0">{report.summary}</p>
            </div>

            {/* Scorecard chart */}
            <div className="row">
                <div className="col-md-5 mb-4">
                    <div className="bg-light-dark p-4 rounded h-100">
                        <h5 className="text-info mb-3">Scorecard</h5>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#f0f0f0" />
                                <YAxis domain={[0, 100]} stroke="#f0f0f0" />
                                <Tooltip cursor={{ fill: '#1a1d1f' }} />
                                <Bar dataKey="value">
                                    {chartData.map((entry, i) => (
                                        <Cell key={i} fill={barColors[i]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-muted small mb-0">
                            Higher business and growth lift the score; higher risk lowers it.
                        </p>
                    </div>
                </div>

                {/* Analysis sections */}
                <div className="col-md-7 mb-4">
                    <div className="bg-light-dark p-4 rounded h-100">
                        <h5 className="text-info">Business Analysis</h5>
                        <p className="text-light small">{report.business_analysis}</p>

                        <h5 className="text-info mt-3">Growth Analysis</h5>
                        <p className="text-light small">{report.growth_analysis}</p>

                        <h5 className="text-info mt-3">Risk Analysis</h5>
                        <p className="text-light small mb-0">{report.risk_analysis}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportView
