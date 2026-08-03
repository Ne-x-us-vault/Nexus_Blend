import { CheckIcon } from "../icons";

interface RequirementCardProps {
  requirement: string;
}

export default function RequirementCard({ requirement }: RequirementCardProps) {
  return (
    <div className="req-item">
      <CheckIcon width={15} height={15} />
      <span>{requirement}</span>
    </div>
  );
}
