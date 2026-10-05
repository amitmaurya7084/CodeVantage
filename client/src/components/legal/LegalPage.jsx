import Seo from "../Seo";
import RichText from "../RichText";
import Container from "../ui/Container";

function LegalPage({ title, lastUpdated, children, dynamicSections }) {
  return (
    <Container size="md">
      <Seo title={title} description={`${title} for CodeVantage's internship platform.`} />
      <h1 className="text-h1 text-navy mb-2">{title}</h1>
      <p className="text-sm text-muted mb-10">Last updated: {lastUpdated}</p>
      <div className="max-w-none space-y-6 text-muted leading-relaxed
        [&_h2]:text-navy [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-2
        [&_h3]:text-navy [&_h3]:font-semibold [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-2
        [&_p]:mb-4 [&_p:last-child]:mb-0
        [&_a]:text-brand [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-dark
        [&_strong]:font-semibold [&_strong]:text-navy
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1"
      >
        {dynamicSections
          ? dynamicSections.map((section) => (
              <div key={section.heading}>
                <h2>{section.heading}</h2>
                <RichText html={section.body} />
              </div>
            ))
          : children}
      </div>
    </Container>
  );
}

export default LegalPage;
