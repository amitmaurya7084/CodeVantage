import { useEffect, useState } from "react";
import SectionHeading from "../components/ui/SectionHeading";
import Container from "../components/ui/Container";
import ProgramCard from "../components/ProgramCard";
import Seo from "../components/Seo";
import { programs as staticPrograms } from "../data/programs";
import { fetchPrograms } from "../services/programService";

function Internships() {
  const [programs, setPrograms] = useState(staticPrograms);

  useEffect(() => {
    fetchPrograms()
      .then((data) => {
        if (data && data.length > 0) setPrograms(data);
      })
      .catch(() => {
        // Keep static fallback — the listing should never show empty.
      });
  }, []);

  return (
    <Container size="full">
      <Seo
        title="Internship Programs"
        description="Explore CodeVantage's project-based internship programs in Web Development, JavaScript, PHP & MySQL, and Python."
        path="/internships"
      />
      <SectionHeading
        eyebrow="All Programs"
        title="Internship Programs"
        description="Every program follows the same structure: 3 real projects, expert review, and a certificate on successful completion."
      />
      <div className="grid xs:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {programs.map((program) => (
          <ProgramCard key={program.slug} program={program} />
        ))}
      </div>
    </Container>
  );
}

export default Internships;
