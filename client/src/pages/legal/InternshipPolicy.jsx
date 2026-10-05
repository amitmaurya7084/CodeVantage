import { useEffect, useState } from "react";
import LegalPage from "../../components/legal/LegalPage";
import { fetchContent } from "../../services/contentService";

function InternshipPolicy() {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    fetchContent(["legal.internshipPolicy"])
      .then((data) => {
        if (data["legal.internshipPolicy"]?.sections) setSections(data["legal.internshipPolicy"].sections);
      })
      .catch(() => {
        // Keep static fallback below.
      });
  }, []);

  return (
    <LegalPage title="Internship Policy" lastUpdated="[Insert Date]" dynamicSections={sections}>
      <h2>Program Structure</h2>
      <p>
        Each internship program runs for 1 month, is fully virtual, and consists of 3 project
        tasks. Students may work at their own pace within the program duration.
      </p>

      <h2>Task Assignment</h2>
      <p>
        Upon registration, a student is automatically assigned their selected program and its
        associated tasks. Task instructions, requirements, and expected outputs are provided in
        full on the student dashboard.
      </p>

      <h2>Review Process</h2>
      <p>
        Every submission is reviewed by the CodeVantage team and marked Approved, Rejected, or
        Changes Requested, with written comments. Students may revise and resubmit a task any
        number of times until it is approved.
      </p>

      <h2>Internship Status</h2>
      <p>
        A student's internship status is "Active" until all tasks are approved, at which point it
        becomes "Completed." Certificate eligibility is calculated automatically from actual task
        approval status.
      </p>

      <h2>Termination</h2>
      <p>
        CodeVantage reserves the right to suspend an account for plagiarism, abusive behavior, or
        violation of the Terms & Conditions.
      </p>
    </LegalPage>
  );
}

export default InternshipPolicy;
