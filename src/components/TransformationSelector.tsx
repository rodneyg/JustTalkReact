import React from "react";
import { Select } from "@chakra-ui/react";

interface TransformationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TransformationSelector: React.FC<TransformationSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="summarize">Summarize</option>
      <option value="formalize">Formalize</option>
      <option value="convert to bullet points">Convert to Bullet Points</option>
    </Select>
  );
};

export default TransformationSelector;
