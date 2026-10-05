import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import Seo from "../components/Seo";
import { getProgramBySlug } from "../data/programs";
import { webDevTasks } from "../data/tasks";
import { fetchProgramBySlug, fetchProgramTasks } from "../services/programService";

function ProgramDetail() {
  const { slug } = useParams();
  const [program, setProgram] = useState(() => getProgramBySlug(slug) || null);
  const [tasks, setTasks] = useState(slug === "web-development" ? webDevTasks : null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);

    fetchProgramBySlug(slug)
      .then((data) => setProgram(data))
      .catch(() => {
        // Fall back to static data (already set in initial state) if the
        // program truly doesn't exist anywhere, flag not-found.
        if (!getProgramBySlug(slug)) setNotFound(true);
      })
      .finally(() => setIsLoading(false));

    fetchProgramTasks(slug)
      .then((data) => {
        if (data && data.length > 0) setTasks(data);
      })
      .catch(() => {
        // Keep static fallback (only web-development has one) or null.
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (notFound || !program) {
    return (
      <Container size="md" className="text-center">
        <h1 className="text-h1 text-navy mb-2">Program Not Found</h1>
        <p className="text-muted mb-6">We couldn't find an internship program at this URL.</p>
        <Button to="/internships">Browse All Programs</Button>
      </Container>
    );
  }

  return (
    <div>
      <Seo
        title={`${program.name} Internship`}
        description={program.shortDescription}
        path={`/internships/${program.slug}`}
      />
      <section className="bg-navy py-12 sm:py-16">
        <Container size="xl" padY={false}>
          {program.isPopular && <Badge className="mb-4 bg-white/10 text-cyan">Most Popular</Badge>}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">{program.name} Internship</h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base">{program.shortDescription}</p>
          <div className="flex flex-wrap gap-3 sm:gap-6 mt-6 text-sm text-slate-300">
            <span>Duration: {program.durationLabel}</span>
            <span>Projects: {program.projectsCount}</span>
            <span>Level: {program.level}</span>
            <span>Format: {program.format}</span>
          </div>
          <Button to="/register" size="lg" className="mt-8 w-full xs:w-auto justify-center">
            Apply Now <ArrowRight className="h-4 w-4" />
          </Button>
        </Container>
      </section>

      <Container size="xl" className="space-y-10 sm:space-y-14">
        <div>
          <h2 className="text-h2 text-navy mb-3">Program Overview</h2>
          <p className="text-muted leading-relaxed">
            {program.overview ||
              `This is a virtual, project-based internship. You'll receive ${program.projectsCount} structured project tasks, build and deploy them at your own pace within ${program.durationLabel.toLowerCase()}, and submit each for review. A Certificate of Internship Completion is available after all projects are approved and the ₹149 certificate processing fee is paid.`}
          </p>
        </div>

        <div>
          <h2 className="text-h2 text-navy mb-3">Eligibility</h2>
          <ul className="space-y-2 text-muted">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              Open to students and beginners — no prior professional experience required.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />A basic
              understanding of {program.name} fundamentals is helpful but not mandatory.
            </li>
          </ul>
        </div>

        {tasks && tasks.length > 0 && (
          <div>
            <h2 className="text-h2 text-navy mb-6">Projects</h2>
            <div className="space-y-6">
              {tasks.map((task) => (
                <Card key={task.order} className="p-6">
                  <Badge className="mb-3">Task {task.order}</Badge>
                  <h3 className="text-lg font-bold text-navy mb-2">{task.title}</h3>
                  <p className="text-muted mb-4">{task.description}</p>

                  <div className="grid sm:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="font-semibold text-navy mb-2">Objectives</p>
                      <ul className="space-y-1.5 text-muted">
                        {task.objectives?.map((o) => (
                          <li key={o} className="flex gap-2">
                            <span className="text-brand">•</span> {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-navy mb-2">Requirements</p>
                      <ul className="space-y-1.5 text-muted">
                        {task.requirements?.map((r) => (
                          <li key={r} className="flex gap-2">
                            <span className="text-brand">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {task.technologies?.map((t) => (
                      <Badge key={t} tone="neutral">
                        {t}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-muted mt-4">
                    <span className="font-semibold text-navy">Expected output: </span>
                    {task.expectedOutput}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-h2 text-navy mb-3">Submission & Review Process</h2>
          <p className="text-muted leading-relaxed">
            For each task, submit your GitHub repository URL and live project URL (and a LinkedIn
            post URL, if applicable). Our team reviews every submission and marks it Approved,
            Rejected, or Changes Requested with comments. You can update and resubmit until it's
            approved.
          </p>
        </div>

        <div>
          <h2 className="text-h2 text-navy mb-3">Certificate Policy</h2>
          <p className="text-muted leading-relaxed">
            The certificate is <strong>not</strong> automatically issued after payment. You must
            first have all {program.projectsCount} projects Approved. Once eligible, a one-time
            ₹149 certificate processing fee applies. See our{" "}
            <Link to="/certificate-policy" className="text-brand underline">
              Certificate Policy
            </Link>{" "}
            for full details.
          </p>
        </div>

        <div className="text-center pt-4">
          <Button to="/register" size="lg">
            Apply for {program.name} Internship <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default ProgramDetail;
