import { jsPDF } from "jspdf"

// Turn a research report into a downloadable PDF.
// Kept plain text + manual line wrapping so we don't pull in extra plugins.
export function exportReportToPdf(report) {
    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const marginX = 48
    const maxWidth = 500
    let y = 60

    const line = (text, size = 11, bold = false, gap = 18) => {
        doc.setFontSize(size)
        doc.setFont("helvetica", bold ? "bold" : "normal")
        const wrapped = doc.splitTextToSize(text, maxWidth)
        wrapped.forEach((row) => {
            if (y > 780) {
                doc.addPage()
                y = 60
            }
            doc.text(row, marginX, y)
            y += gap
        })
    }

    const section = (title, body) => {
        y += 8
        line(title, 13, true)
        line(body || "-")
    }

    line(report.company?.name || "Company", 20, true, 26)
    line(`Sector: ${report.company?.sector || "Unspecified"}`, 11)
    line(`Generated: ${new Date(report.created_at).toLocaleString()}`, 10)

    y += 6
    line(`Verdict: ${report.verdict_label} (${report.score?.overall_score}/100)`, 14, true)
    line(
        `Business ${report.score?.business_score} | ` +
        `Growth ${report.score?.growth_score} | ` +
        `Risk ${report.score?.risk_score}`,
        11
    )

    section("Summary", report.summary)
    section("Business Analysis", report.business_analysis)
    section("Growth Analysis", report.growth_analysis)
    section("Risk Analysis", report.risk_analysis)

    const safeName = (report.company?.name || "report").replace(/[^a-z0-9]/gi, "_")
    doc.save(`${safeName}_research.pdf`)
}
