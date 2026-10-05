import { Clock, Layers, BarChart3, ArrowRight, Monitor, Braces, Database, Terminal } from "lucide-react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const iconMap = {
  monitor: Monitor,
  braces: Braces,
  database: Database,
  terminal: Terminal,
};

// A distinct accent color per program so the grid doesn't look monotone —
// loosely nods at each language's common brand color without reproducing
// any official logo artwork.
const iconStyles = {
  monitor: "bg-brand/10 text-brand",
  braces: "bg-amber-100 text-amber-600",
  database: "bg-purple-100 text-purple-600",
  terminal: "bg-emerald-100 text-emerald-600",
};

function ProgramCard({ program }) {
  const Icon = iconMap[program.icon] || Monitor;
  const iconStyle = iconStyles[program.icon] || iconStyles.monitor;

  return (
    <Card hoverable className="p-6 flex flex-col relative h-full">
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${iconStyle}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        {program.isPopular && (
          <Badge tone="solid" className="whitespace-nowrap">
            Most Popular
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-bold text-navy mt-4">{program.name}</h3>
      <p className="text-sm text-muted mt-2 flex-1">{program.shortDescription}</p>

      <ul className="text-sm text-navy/80 mt-4 space-y-2">
        <li className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand" /> Duration: {program.durationLabel}
        </li>
        <li className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand" /> Projects: {program.projectsCount}
        </li>
        <li className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand" /> Level: {program.level}
        </li>
      </ul>

      <Button
        to={`/internships/${program.slug}`}
        variant={program.isPopular ? "primary" : "outline"}
        className="mt-6 w-full"
      >
        Learn More <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}

export default ProgramCard;
