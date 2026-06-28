import { Link } from "react-router-dom"
import { useContext } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBuilding, faChartColumn, faFileLines, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { AuthContext } from "../AuthProvider"

// Landing page shown at "/"
const MainContent = () => {
    const { isLoggedIn } = useContext(AuthContext)

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <h1 className="text-light mb-3">Research any company</h1>
                    <p className="text-light mb-4">
                        Turn a company's <strong>business, growth, and risk</strong> into a
                        score and a clear Invest or Pass verdict you can export as a PDF.
                    </p>

                    {/* Each feature is a plain HTML details element, so it expands on its own */}
                    <div className="feature-accordion">
                        <details className="feature-item" open>
                            <summary>
                                <FontAwesomeIcon icon={faBuilding} className="feature-icon" />
                                <span className="feature-title">Business and growth</span>
                                <FontAwesomeIcon icon={faChevronDown} className="feature-chevron" />
                            </summary>
                            <p className="feature-text">
                                A short read on what the company does, its strengths, and where
                                its growth could come from.
                            </p>
                        </details>

                        <details className="feature-item">
                            <summary>
                                <FontAwesomeIcon icon={faChartColumn} className="feature-icon feature-icon-green" />
                                <span className="feature-title">Investment score</span>
                                <FontAwesomeIcon icon={faChevronDown} className="feature-chevron" />
                            </summary>
                            <p className="feature-text">
                                Business, growth, and risk are combined into one score out of 100
                                with a transparent weighting.
                            </p>
                        </details>

                        <details className="feature-item">
                            <summary>
                                <FontAwesomeIcon icon={faFileLines} className="feature-icon feature-icon-amber" />
                                <span className="feature-title">Verdict and export</span>
                                <FontAwesomeIcon icon={faChevronDown} className="feature-chevron" />
                            </summary>
                            <p className="feature-text">
                                Get an Invest or Pass call, keep a history of past reports, and
                                download any report as a PDF.
                            </p>
                        </details>
                    </div>

                    <div className="mt-4">
                        {isLoggedIn ? (
                            <Link to="/research">
                                <button className="btn btn-info btn-lg">Start researching</button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register">
                                    <button className="btn btn-info btn-lg me-2">Get started</button>
                                </Link>
                                <Link to="/login">
                                    <button className="btn btn-outline-light btn-lg">Login</button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainContent
