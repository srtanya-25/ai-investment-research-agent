import { Link } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../AuthProvider"

// Landing page shown at "/"
const MainContent = () => {
    const { isLoggedIn } = useContext(AuthContext)

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <h1 className="text-light mb-3">
                        Research Any Company <span className="text-info">in Seconds</span>
                    </h1>
                    <p className="text-light mb-4">
                        Type in a company name and the agent reviews its{" "}
                        <strong>business fundamentals, growth outlook, and risks</strong>,
                        turns them into an investment score, and gives you a clear
                        Invest or Pass verdict you can export as a PDF.
                    </p>

                    <div className="row mt-5 text-start">
                        <div className="col-md-4 mb-3">
                            <div className="bg-light-dark p-3 rounded h-100">
                                <h5 className="text-info">Business & Growth</h5>
                                <p className="text-light small mb-0">
                                    A short read on what the company does, its strengths,
                                    and where its growth could come from.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="bg-light-dark p-3 rounded h-100">
                                <h5 className="text-info">Investment Score</h5>
                                <p className="text-light small mb-0">
                                    Business, growth, and risk are combined into one
                                    score out of 100 with a transparent weighting.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="bg-light-dark p-3 rounded h-100">
                                <h5 className="text-info">Verdict & Export</h5>
                                <p className="text-light small mb-0">
                                    Get an Invest or Pass call, keep a history of past
                                    reports, and download any report as a PDF.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        {isLoggedIn ? (
                            <Link to="/research">
                                <button className="btn btn-info btn-lg">Start Researching</button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register">
                                    <button className="btn btn-info btn-lg me-2">Get Started</button>
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
