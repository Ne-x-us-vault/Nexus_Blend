import { CheckIcon } from "../icons";

interface ObjectiveListProps {
  objectives: string[];
}

export default function ObjectiveList({ objectives }: ObjectiveListProps) {
  return (
    <ul className="check-list">
      {objectives.map((objective, index) => (
        <li className="check-item" key={index}>
          <CheckIcon width={16} height={16} />
          {objective}
        </li>
      ))}
    </ul>
  );
}
