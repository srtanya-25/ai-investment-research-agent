import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../axiosInstance'

// Company search + run research. On success we jump straight to the report view.
const ResearchPage = () => {
    const [companyName, setCompanyName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const navigate = useNavigate()

    const handleResearch = async (e) => {
        e.preventDefault()
        if (!companyName.trim()) return

        setLoading(true)
        setError(null)
        try {
            // POST /api/v1/research/ runs the full pipeline and returns the saved report
            const response = await axiosInstance.post('/research/', {
                company_name: companyName.trim(),
            })
            navigate(`/reports/${response.data.id}`)
        } catch (err) {
            setError(err.response?.data?.error || "Research failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 bg-light-dark p-5 rounded text-center">
                    <h3 className="text-light mb-3">Research a Company</h3>
                    <p className="text-light small mb-4">
                        Enter a company name. The agent will analyse its business,
                        growth, and risks, then return an investment verdict.
                    </p>

                    <form onSubmit={handleResearch}>
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="e.g. Tesla, Infosys, Shopify"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="btn btn-info btn-lg"
                            disabled={loading || !companyName.trim()}
                        >
                            {loading ? "Researching..." : "Run Research"}
                        </button>
                    </form>

                    {error && <div className="text-danger mt-3">{error}</div>}
                </div>
            </div>
        </div>
    )
}

export default ResearchPage
